const rankGroups = require('./config.json').rankGroups;
const globalRankGroups = require('./config.json').globalRankGroups;
const roleMap = require('./config.json').roleMap;
const scoresaberRegion = require('./config.json').scoresaberRegion;
const database = require('./config.json').database;
const errorChannelId = require('./config.json').errorChannelId;
const rankUpdateChannelId = require('./config.json').rankUpdateChannelId;
const scraper = require('./scraper.js');
const Keyv = require('keyv');
const db1 = new Keyv(`${database}`, { namespace: 'scoresaber' });
db1.on('error', err => console.error('Keyv connection error:', err));
require('events').EventEmitter.defaultMaxListeners = 100;

module.exports = {

	async autoUpdateRoles(guild) {
		console.log('Running automatic role update.');
		const players = await scraper.getPlayers().catch(err => {
			console.log(err);
		});
		module.exports.updateRoles(players, guild).then(() => {
			console.log('Automatic role update complete.');
		});
		return players;
	},

	async updateRoles(players, guild) {
		// Create a dictionary of the rank groups and corresponding role objects
		const rankRoles = {};
		const guildRoles = guild.roles.cache;
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
			const guildMember = await guild.members.fetch(discordId).catch(() => {

				if (errorChannelId !== '' && errorChannelId !== undefined) {
					const errorChannel = guild.channels.cache.get(errorChannelId);
					if (errorChannel !== undefined) {
						errorChannel.send(`Could not find user <@${discordId}> with id ${discordId}`);
					}
				}
				console.log(`Could not find user <@${discordId}> with id ${discordId}`);
			});
			if (guildMember === undefined) continue;

			// Work out which rank group they fall under
			let rankGroup = '';
			for (let n = 0; n < rankGroups.length; n++) {
				if (rank <= rankGroups[n][1]) {
					rankGroup = rankGroups[n][0];
					break;
				}
			}

			let removedRole;
			let removedRoleIndex;
			let addedRole;
			let addedRoleIndex;

			// Removes rank roles they shouldn't have
			for (const [rankRoleName, rankRole] of Object.entries(rankRoles)) {
				if (guildMember.roles.cache.some(role => role === rankRole) && rankRole.name !== rankGroup) {
					try {
						await guildMember.roles.remove(rankRole);
						removedRole = rankRole;
						console.log(`Removed role from ${guildMember.user.tag}: ${rankRoleName}`);
					} catch(err) {
						console.log(err);
					}
				}
			}

			// Adds their current rank role if they don't already have it
			if (!guildMember.roles.cache.some(role => role.name === rankGroup) && rankGroup !== '') {
				try {
					await guildMember.roles.add(rankRoles[rankGroup]);
					addedRole = rankRoles[rankGroup];
					console.log(`Added role to ${guildMember.user.tag}: ${rankRoles[rankGroup].name}`);
				} catch(err) {
					console.log(err);
				}
			}

			if (removedRole === undefined || addedRole === undefined) continue;

			for (let p = 0; p < rankGroups.length; p++) {
				if (rankGroups[p][0] === removedRole.name) {
					removedRoleIndex = p;
				}
			}

			for (let p = 0; p < rankGroups.length; p++) {
				if (rankGroups[p][0] === addedRole.name) {
					addedRoleIndex = p;
				}
			}

			if (addedRoleIndex < removedRoleIndex) {
				if (rankUpdateChannelId !== '' && rankUpdateChannelId !== undefined) {
					const rankUpdateChannel = guild.channels.cache.get(rankUpdateChannelId);
					if (rankUpdateChannel !== undefined) {
						rankUpdateChannel.send(`${guildMember.user.username} has advanced to ${addedRole.name}`);
					}
				}
			}
		}
		await module.exports.updateGlobalRoles(guild);
	},

	async updateGlobalRoles(guild) {
		console.log('Updating global rank roles');
		// Create a dictionary of the global rank groups and corresponding role objects
		const globalRankRoles = {};
		const guildRoles = guild.roles.cache;
		for (const rolePair of guildRoles) {
			const role = rolePair[1];
			for (let p = 0; p < globalRankGroups.length; p++) {
				if (role.name === globalRankGroups[p][0]) {
					globalRankRoles[globalRankGroups[p][0]] = role;
				}
			}
		}

		const players = await scraper.getTopGlobalPlayers();

		for (let i = 0; i < players.length; i++) {


			const scoresaber = players[i];
			const rank = i + 1;

			// Request the discord id of the individual with this Scoresaber profile from the database
			const discordId = await db1.get(scoresaber).catch(err => {
				console.log(err);
			});
			if (discordId === undefined) continue;

			// Get their guildMemeber object
			const guildMember = await guild.members.fetch(discordId).catch(() => {

				if (errorChannelId !== '' && errorChannelId !== undefined) {
					const errorChannel = guild.channels.cache.get(errorChannelId);
					if (errorChannel !== undefined) {
						errorChannel.send(`Could not find user <@${discordId}> with id ${discordId}`);
					}
				}
				console.log(`Could not find user <@${discordId}> with id ${discordId}`);
			});
			if (guildMember === undefined) continue;

			// Work out which rank group they fall under
			let rankGroup = '';
			for (let n = 0; n < globalRankGroups.length; n++) {
				if (rank <= globalRankGroups[n][1]) {
					rankGroup = globalRankGroups[n][0];
					break;
				}
			}

			// Removes rank roles they shouldn't have
			for (const [rankRoleName, rankRole] of Object.entries(globalRankRoles)) {
				if (guildMember.roles.cache.some(role => role === rankRole) && rankRole.name !== rankGroup) {
					try {
						await guildMember.roles.remove(rankRole);
						console.log(`Removed role from ${guildMember.user.tag}: ${rankRoleName}`);
					} catch(err) {
						console.log(err);
					}
				}
			}

			// Adds their current rank role if they don't already have it
			if (!guildMember.roles.cache.some(role => role.name === rankGroup) && rankGroup !== '') {
				try {
					await guildMember.roles.add(globalRankRoles[rankGroup]);
					console.log(`Added role to ${guildMember.user.tag}: ${globalRankRoles[rankGroup].name}`);
				} catch(err) {
					console.log(err);
				}
			}
		}
		console.log('Finished updating global rank roles');
	},

	async addRegionRole(scoresaber, guildMember) {
		const region = await scraper.getRegion(scoresaber);
		let i = -1;
		for (let n = 0; n < roleMap.length; n++) {
			if (roleMap[n][0] === region) {
				i = n;
			}
		}
		if (i === -1) {
			i = roleMap.length - 1;
		}
		const regionalRoleName = roleMap[i][1];

		// Adds their region role if they don't already have it
		if (!guildMember.roles.cache.some(role => role.name === regionalRoleName)) {
			try {
				let regionalRole;
				const guildRoles = guildMember.guild.roles.cache;
				for (const rolePair of guildRoles) {
					const role = rolePair[1];
					if (role.name === regionalRoleName) {
						regionalRole = role;
					}
				}

				if (regionalRole == null) {
					console.log(`Error adding role to ${guildMember.user.tag}: ${regionalRole.name}`);
					return;
				}

				await guildMember.roles.add(regionalRole);
				console.log(`Added role to ${guildMember.user.tag}: ${regionalRole.name}`);

			} catch(err) {
				console.log(err);
			}
		}
	},

	async addRankRole(scoresaber, guildMember) {
		// Check they're in the region
		const region = await scraper.getRegion(scoresaber);
		let i = -1;
		for (let n = 0; n < roleMap.length; n++) {
			if (roleMap[n][0] === region) {
				i = n;
			}
		}
		if (i === -1) return;

		if (scoresaberRegion.length !== 2) {
			module.exports.autoUpdateRoles(guildMember.guild);
			return;
		}

		// Create a dictionary of the rank groups and corresponding role objects
		const rankRoles = {};
		const guildRoles = guildMember.guild.roles.cache;
		for (const rolePair of guildRoles) {
			const role = rolePair[1];
			for (let p = 0; p < rankGroups.length; p++) {
				if (role.name === rankGroups[p][0]) {
					rankRoles[rankGroups[p][0]] = role;
				}
			}
		}

		const playerData = await scraper.getPlayerData(scoresaber);
		const rank = playerData[0];

		// Work out which rank group they fall under
		let rankGroup = '';
		for (let n = 0; n < rankGroups.length; n++) {
			if (rank <= rankGroups[n][1]) {
				rankGroup = rankGroups[n][0];
				break;
			}
		}

		if (rankGroup === '') return;

		// Removes rank roles they shouldn't have
		for (const [rankRoleName, rankRole] of Object.entries(rankRoles)) {
			if (guildMember.roles.cache.some(role => role === rankRole) && rankRole.name !== rankGroup) {
				try {
					await guildMember.roles.remove(rankRole);
					console.log(`Removed role from ${guildMember.user.tag}: ${rankRoleName}`);
				} catch(err) {
					console.log(err);
				}
			}
		}

		// Adds their current rank role if they don't already have it
		if (!guildMember.roles.cache.some(role => role.name === rankGroup) && rankGroup !== '') {
			try {
				await guildMember.roles.add(rankRoles[rankGroup]);
				console.log(`Added role to ${guildMember.user.tag}: ${rankRoles[rankGroup].name}`);
			} catch(err) {
				console.log(err);
			}
		}

	},
};