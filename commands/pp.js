const scraper = require('../scraper.js');
const database = require('../config.json').database;
const Keyv = require('keyv');
const db2 = new Keyv(`${database}`, { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'pp',
	description: 'Returns your pp.',
	args: false,
	async execute(message) {

		// If user is in database, return associated Scoresaber profile
		const scoresaber = await db2.get(message.author.id).catch(err => {
			console.log(err);
		});

		if (scoresaber == null) {
			message.channel.send('You are not in the database.');
			return;
		}

		const playerData = await scraper.getPlayerData(scoresaber);
		const pp = playerData[3];

		message.channel.send(`You have ${pp}pp`);
	},
};