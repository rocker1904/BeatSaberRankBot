const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, staff, serverId, interval } = require('./config.json');
const autoUpdateInterval = interval * 60 * 1000;
const autoUpdateRoles = require('./roleUpdater').autoUpdateRoles;

const client = new Discord.Client();

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

let updater;
let server;

client.once('ready', () => {
	server = client.guilds.get(serverId);
	// Wrapper for updater
	updater = new class {
		constructor() {
			this.timeout = client.setInterval(() => { autoUpdateRoles(server); }, autoUpdateInterval);
			this.stopped = false;
			console.log('Updater started.');
		}
		stop() {
			this.stopped = true;
			client.clearInterval(this.timeout);
			console.log('Updater stopped.');
		}
		start() {
			if (this.stopped === true) {
				this.stopped = false;
				this.timeout = client.setInterval(() => { autoUpdateRoles(server); }, autoUpdateInterval);
				console.log('Updater started again.');
			}
		}
	};
	console.log('Ready!');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;

	if (command.staffOnly && !staff.includes(message.author.tag)) {
		message.reply('this command is staff only.');
		return;
	}

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can only execute that command on the server.');
	}

	if (message.guild.id !== serverId) {
		return message.reply('I can only execute that command on the server.');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id) && !staff.includes(message.author.tag)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args, updater, server, client);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});


client.on('error', err => {
	console.error(err);
});

client.login(token);