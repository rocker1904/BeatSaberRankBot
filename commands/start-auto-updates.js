module.exports = {
	name: 'start-auto-updates',
	description: 'Starts the automatic role updater.',
	args: false,
	staffOnly: true,
	execute(message, args, updater) {
		if (updater.stopped) {
			console.log(updater);
			updater.start();
			console.log(updater);
			message.channel.send('Started.');
		} else {
			message.channel.send('Updater is already running.');
			console.log(updater);
		}
	},
};