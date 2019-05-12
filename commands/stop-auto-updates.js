module.exports = {
	name: 'stop-auto-updates',
	description: 'Stops the automatic role updater.',
	args: false,
	staffOnly: true,
	execute(message, args, updater) {
		if (!updater.stopped) {
			updater.stop();
			message.channel.send('Stopped.');
		} else {
			message.channel.send('Auto-updater wasn\'t running.');
		}
	},
};