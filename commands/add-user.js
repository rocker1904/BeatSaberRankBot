const database = require('../config.json').database;
const Keyv = require('keyv');
const db1 = new Keyv(`${database}`, { namespace: 'scoresaber' });
db1.on('error', err => console.error('Keyv connection error:', err));
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'add-user',
	description: 'Adds the tagged user or user id and their scoresaber profile to the database.',
	args: true,
	usage: '<user> <scoresaber profile>',
	staffOnly: true,
	async execute(message, args, updater, server) {

		let scoresaber = args[1];

		// Reject command if arg doesn't contain /u/ and remove anything before it
		const startOfId = scoresaber.indexOf('/u/');
		if (startOfId !== -1) {
			scoresaber = scoresaber.slice(startOfId);
		} else {
			message.channel.send('Please use a valid scoresaber profile.');
			return;
		}

		// Remove any sorts (ie page or recent) from the string
		const endOfId = scoresaber.indexOf('&');
		if (endOfId !== -1) {
			scoresaber = scoresaber.slice(0, endOfId);
		}

		let userId;

		// If no user mentioned
		if (!message.mentions.users.size) {
			userId = args[0];
			try {
				await server.fetchMember(userId);
			} catch(err) {
				message.channel.send('Invalid user id.');
				return;
			}

		// If user mentioned
		} else {
			userId = message.mentions.users.first().id;
		}

		// If neither the discord user or Scoresaber profile is already in the database, add them
		const lookup1 = await db1.get(scoresaber).catch(err => {
			console.log(err);
		});
		const lookup2 = await db2.get(userId).catch(err => {
			console.log(err);
		});
		if (lookup1 === undefined) {
			if (lookup2 === undefined) {
				db1.set(scoresaber, userId).then(() => {
					db2.set(userId, scoresaber).then(() => {
						message.channel.send('Added user.');
					}).catch(err => {
						console.log(err);
					});
				}).catch(err => {
					console.log(err);
				});
			} else {
				message.channel.send('That user has already been added.');
			}
		} else {
			message.channel.send('That Scoresaber profile has already been added.');
		}
	},
};