const scoresaberRegion = require('../config.json').scoresaberRegion;
const customRegionName = require('../config.json').customRegionName;
const numPlayersToScrape = require('../config.json').numPlayersToScrape;
const database = require('../config.json').database;
const Keyv = require('keyv');
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'oce-rank',
	description: 'Returns your regional rank.',
	args: false,
	guildOnly: true,
	staffOnly: false,
	async execute(message, args, updater, server, client, regionalPlayers) {

		// If user is in database, return associated Scoresaber profile
		const scoresaber = await db2.get(message.author.id).catch(err => {
			console.log(err);
		});

		if (scoresaber === undefined) {
			message.channel.send('You are not in the database.');
			return;
		}

		if (!regionalPlayers.length) {
			message.channel.send('monkaHmm');
			return;
		}

		const regionalRank = regionalPlayers.indexOf(scoresaber) + 1;
		let regionName;
		if (customRegionName !== undefined && customRegionName !== '') {
			regionName = customRegionName;
		} else {
			regionName = scoresaberRegion.toUpperCase();
		}

		if (regionalRank) {
			message.channel.send(`Your ${regionName} rank is ${regionalRank}!`);
		} else {
			message.channel.send(`You are not in the top ${numPlayersToScrape} ${regionName}`);
		}
	},
};