const scraper = require('../scraper.js');
const database = require('../config.json').database;
const Keyv = require('keyv');
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'rank',
	description: 'Returns your regional rank.',
	args: false,
	guildOnly: true,
	staffOnly: false,
	async execute(message) {

		// If user is in database, return associated Scoresaber profile
		const scoresaber = await db2.get(message.author.id).catch(err => {
			console.log(err);
		});

		if (scoresaber === undefined) {
			message.channel.send('You are not in the database.');
			return;
		}

		const playerData = await scraper.getPlayerData(scoresaber);

		message.channel.send(`You are #${playerData[0]} ${playerData[1].toUpperCase()} (#${playerData[2]} global)`);
	},
};