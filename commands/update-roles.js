const scraper = require('../scraper.js');
const updateRoles = require('../roleUpdater').updateRoles;
require('events').EventEmitter.defaultMaxListeners = 100;

module.exports = {
	name: 'update-roles',
	description: 'Updates rank roles.',
	args: false,
	guildOnly: true,
	staffOnly: true,
	async execute(message, args, updater, server) {
		message.channel.send('Getting roles...');
		console.log('Getting ranks...');
		scraper.getPlayers().then(async players => {

			console.log('Updating roles...');
			message.channel.send('Updating roles...');
			await updateRoles(players, server);
			console.log('Roles updated...');
			message.channel.send('Roles updated.');

		}).catch(err => {
			console.log(err);
		});
	},
};