const scraper = require('./scraper.js');
const Keyv = require('keyv');
const db1 = new Keyv('mongodb://localhost:27017/bsdb', { namespace: 'scoresaber' });
db1.on('error', err => console.error('Keyv connection error:', err));
require('events').EventEmitter.defaultMaxListeners = 100;

module.exports = {

	async autoUpdateRoles(BBSD) {
		console.log('Running automatic role update.');
		scraper.getPlayers().then(async players => {
			await module.exports.updateRoles(players, BBSD);
		}).catch(err => {
			console.log(err);
		});
		console.log('Automatic role update complete.');
	},

	async updateRoles(players, server) {
		// Create a dictionary of the rank groups and corresponding role objects
		const rankRoles = {};
		const rankGroups = ['Rank 1 Brit', 'Top 10', 'Top 25', 'Top 50', 'Top 100', 'Top 250', 'Top 500', 'Top 1000'];
		const guildRoles = server.roles;
		for (const rolePair of guildRoles) {
			const role = rolePair[1];
			for (let p = 0; p < rankGroups.length; p++) {
				if (role.name === rankGroups[p]) {
					rankRoles[rankGroups[p]] = role;
				}
			}
		}

		for (let i = 0; i < players.length; i++) {

			const scoresaber = players[i];
			const rank = i + 1;

			// Request the discord id of the individual with this scoresaber profile from the database
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
			if (rank === 1) {
				rankGroup = 'Rank 1 Brit';
			} else if (rank < 11) {
				rankGroup = 'Top 10';
			} else if (rank < 26) {
				rankGroup = 'Top 25';
			} else if (rank < 51) {
				rankGroup = 'Top 50';
			} else if (rank < 101) {
				rankGroup = 'Top 100';
			} else if (rank < 251) {
				rankGroup = 'Top 250';
			} else if (rank < 501) {
				rankGroup = 'Top 500';
			} else if (rank < 1001) {
				rankGroup = 'Top 1000';
			}

			// Removes rank roles they shouldn't have
			for (const [rankRoleName, rankRole] of Object.entries(rankRoles)) {
				if (discordMember.roles.some(role => role === rankRole) && rankRole.name !== rankGroup) {
					discordMember.removeRole(rankRole).then(() => {
						console.log(`Removed role from ${discordMember.user.tag}: ${rankRoleName}`);
					}).catch(err => {
						console.log(err);
					});
				}
			}

			// Adds their current rank role if they don't already have it
			if (!discordMember.roles.some(role => role.name === rankGroup) && rankGroup !== '') {
				discordMember.addRole(rankRoles[rankGroup]).then(() => {
					console.log(`Added role to ${discordMember.user.tag}: ${rankRoles[rankGroup].name}`);
				}).catch(err => {
					console.log(err);
				});
			}
		}
	},
};