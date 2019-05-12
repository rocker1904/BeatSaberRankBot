const Keyv = require('keyv');
const db1 = new Keyv('mongodb://localhost:27017/bsdb', { namespace: 'scoresaber' });
db1.on('error', err => console.error('Keyv connection error:', err));
const db2 = new Keyv('mongodb://localhost:27017/bsdb', { namespace: 'discord' });
db2.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'add-me',
	description: 'Adds the user and their scoresaber profile to the database.',
	args: true,
	usage: '<scoresaber profile>',
	async execute(message, args) {

		const user = message.author.id;
		let scoresaber = args[0];

		// Reject command if arg doesn't contain /u/ and remove anything before it
		const startOfId = scoresaber.indexOf('/u/');
		if (startOfId !== -1) {
			scoresaber = scoresaber.slice(startOfId);
		} else {
			message.channel.send('Please use a valid scoresaber profile.');
			return;
		}

		// Remove any sorts (ie page or recent) from the string
		const endOfId = scoresaber.indexOf('&');
		if (endOfId !== -1) {
			scoresaber = scoresaber.slice(0, endOfId);
		}

		// If neither the discord user or scoresaber profile is already in the database, add user
		const lookup1 = await db1.get(scoresaber).catch(err => {
			console.log(err);
		});
		const lookup2 = await db2.get(user).catch(err => {
			console.log(err);
		});
		if (lookup1 === undefined) {
			if (lookup2 === undefined) {
				db1.set(scoresaber, user).then(() => {
					db2.set(user, scoresaber).then(() => {
						message.channel.send('Added user.');
					}).catch(err => {
						console.log(err);
					});
				}).catch(err => {
					console.log(err);
				});
			} else {
				message.channel.send('You\'ve already been added.');
			}
		} else {
			message.channel.send('That Scoresaber profile has already been added.');
		}
	},
};