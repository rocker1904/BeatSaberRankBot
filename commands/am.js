const scraper = require('../scraper.js');
const database = require('../config.json').database;
const Keyv = require('keyv');
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'am',
	description: 'Returns the pp diff of you and the people around you.',
	args: false,
	guildOnly: true,
	async execute(message) {
		// If user is in database, return associated Scoresaber profile
		const commandUserScoresaber = await db2.get(message.author.id).catch(err => {
			console.log(err);
		});

		if (commandUserScoresaber == null) {
			message.channel.send('You are not in the database.');
			return;
		}

		const commandUserData = await scraper.getPlayerData(commandUserScoresaber);
		const commandUserPP = commandUserData[3];
		const commandUserRank = commandUserData[2];
		let commandUserName = commandUserData[4];

		const lowerPlayerScoresaber = await scraper.getPlayerAtRank(commandUserRank + 1);
		const lowerPlayerData = await scraper.getPlayerData(lowerPlayerScoresaber);
		const lowerPlayerPP = lowerPlayerData[3];
		const lowerPlayerRank = lowerPlayerData[2];
		const lowerPlayerName = lowerPlayerData[4];

		if (commandUserRank === 1) {
			message.channel.send(`You are ${(commandUserPP - lowerPlayerPP).toFixed(2)}PP above ${lowerPlayerName}`);
			return;
		}

		const higherPlayerScoresaber = await scraper.getPlayerAtRank(commandUserRank - 1);
		const higherPlayerData = await scraper.getPlayerData(higherPlayerScoresaber);
		const higherPlayerPP = higherPlayerData[3];
		const higherPlayerRank = higherPlayerData[2];
		const higherPlayerName = higherPlayerData[4];


		if (commandUserName === 'Alppuccino') {
			commandUserName = 'Al-PooPoo-Ccino';
		}

		message.channel.send(`__**Global ranks around you:**__\n#${higherPlayerRank} **${higherPlayerName}** has ${(higherPlayerPP - commandUserPP).toFixed(2)} more PP than you.\n#${commandUserRank} **You (${commandUserName})** have ${commandUserPP}PP.\n#${lowerPlayerRank} **${lowerPlayerName}** has ${(commandUserPP - lowerPlayerPP).toFixed(2)} less PP than you.`);
	},
};