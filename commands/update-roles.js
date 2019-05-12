const scraper = require('../scraper.js');
const updateRoles = require('../roleUpdater').updateRoles;
const Keyv = require('keyv');
const db1 = new Keyv('mongodb://localhost:27017/bsdb', { namespace: 'scoresaber' });
db1.on('error', err => console.error('Keyv connection error:', err));
require('events').EventEmitter.defaultMaxListeners = 100;

module.exports = {
	name: 'update-roles',
	description: 'Updates rank roles.',
	args: false,
	guildOnly: true,
	cooldown: 3600,
	async execute(message) {
		message.channel.send('Getting roles...');
		console.log('Getting ranks...');
		scraper.getPlayers().then(async players => {

			console.log('Updating roles...');
			message.channel.send('Updating roles...');
			await updateRoles(players, message.guild);
			console.log('Roles updated...');
			message.channel.send('Roles updated.');

		}).catch(err => {
			console.log(err);
		});
	},
};