const Keyv = require('keyv');
const db1 = new Keyv('mongodb://localhost:27017/bsdb', { namespace: 'scoresaber' });
db1.on('error', err => console.error('Keyv connection error:', err));
const db2 = new Keyv('mongodb://localhost:27017/bsdb', { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'remove-someone',
	description: 'Removes the user or scoresaber profile from the database.',
	args: true,
	usage: '<scoresaber profile>/<user>',
	staffOnly: true,
	async execute(message, args) {

		// If no user mentioned
		if (!message.mentions.users.size) {
			const arg = args[0];
			let scoresaber;
			let userId;

			// Reject command if arg doesn't contain /u/ and remove anything before it
			const startOfId = arg.indexOf('/u/');
			if (startOfId !== -1) {
				scoresaber = arg.slice(startOfId);
			} else {
				try {
					await message.guild.fetchMember(arg);
				} catch(err) {
					message.channel.send('Please use a valid scoresaber profile or user id.');
					return;
				}
				userId = arg;
			}

			// Checks if given scoresaber profile
			if (scoresaber !== undefined) {

				// Remove any sorts (ie page or recent) from the string
				const endOfId = scoresaber.indexOf('&');
				if (endOfId !== -1) {
					scoresaber = scoresaber.slice(0, endOfId);
				}

				// If Scoresaber profile is in database, delete from both namespaces
				const discordId = await db1.get(scoresaber).catch(err => {
					console.log(err);
				});
				if (discordId !== undefined) {
					db1.delete(scoresaber).then(() => {
						db2.delete(discordId).then(() => {
							message.channel.send('Deleted user.');
						}).catch(err => {
							console.log(err);
						});
					}).catch(err => {
						console.log(err);
					});
				} else {
					message.channel.send('That profile isn\'t in the database.');
				}

			// If given user id instead
			} else {
				scoresaber = await db2.get(userId).catch(err => {
					console.log(err);
				});
				if (scoresaber !== undefined) {
					db1.delete(scoresaber).then(() => {
						db2.delete(userId).then(() => {
							message.channel.send('Deleted user.');
						}).catch(err => {
							console.log(err);
						});
					}).catch(err => {
						console.log(err);
					});
				} else {
					message.channel.send('That user isn\'t in the database.');
				}
			}


		// User mentioned
		} else {
			const userId = message.mentions.users.first().id;
			// If discord user is in database, delete from both namespaces
			const scoresaber = await db2.get(userId).catch(err => {
				console.log(err);
			});
			if (scoresaber !== undefined) {
				db1.delete(scoresaber).then(() => {
					db2.delete(userId).then(() => {
						message.channel.send('Deleted user.');
					}).catch(err => {
						console.log(err);
					});
				}).catch(err => {
					console.log(err);
				});
			} else {
				message.channel.send('That user isn\'t in the database.');
			}
		}
	},
};