const rankGroups = require('./config.json').rankGroups;
const database = require('./config.json').database;
const scraper = require('./scraper.js');
const Keyv = require('keyv');
const db1 = new Keyv(`${database}`, { namespace: 'scoresaber' });
db1.on('error', err => console.error('Keyv connection error:', err));
require('events').EventEmitter.defaultMaxListeners = 100;

module.exports = {

	async autoUpdateRoles(server) {
		console.log('Running automatic role update.');
		scraper.getPlayers().then(async players => {
			await module.exports.updateRoles(players, server);
			console.log('Automatic role update complete.');
		}).catch(err => {
			console.log(err);
		});
	},

	async updateRoles(players, server) {
		// Create a dictionary of the rank groups and corresponding role objects
		const rankRoles = {};
		const guildRoles = server.roles;
		for (const rolePair of guildRoles) {
			const role = rolePair[1];
			for (let p = 0; p < rankGroups.length; p++) {
				if (role.name === rankGroups[p][0]) {
					rankRoles[rankGroups[p][0]] = role;
				}
			}
		}

		for (let i = 0; i < players.length; i++) {

			const scoresaber = players[i];
			const rank = i + 1;

			// Request the discord id of the individual with this Scoresaber profile from the database
			const discordId = await db1.get(scoresaber).catch(err => {
				console.log(err);
			});
			if (discordId === undefined) continue;

			// Get their guildMemeber object
			const discordMember = await server.fetchMember(discordId).catch(err => {
				console.log(err);
			});
			if (discordMember === undefined) continue;

			// Work out which rank group they fall under
			let rankGroup = '';
			for (let n = 0; n < rankGroups.length; n++) {
				if (rank <= rankGroups[n][1]) {
					rankGroup = rankGroups[n][0];
					break;
				}
			}

			// Removes rank roles they shouldn't have
			for (const [rankRoleName, rankRole] of Object.entries(rankRoles)) {
				if (discordMember.roles.some(role => role === rankRole) && rankRole.name !== rankGroup) {
					try {
						await discordMember.removeRole(rankRole);
						console.log(`Removed role from ${discordMember.user.tag}: ${rankRoleName}`);
					} catch(err) {
						console.log(err);
					}
				}
			}

			// Adds their current rank role if they don't already have it
			if (!discordMember.roles.some(role => role.name === rankGroup) && rankGroup !== '') {
				try {
					await discordMember.addRole(rankRoles[rankGroup]);
					console.log(`Added role to ${discordMember.user.tag}: ${rankRoles[rankGroup].name}`);
				} catch(err) {
					console.log(err);
				}
			}
		}
	},
};