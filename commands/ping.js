module.exports = {
	name: 'ping',
	description: 'Ping!',
	args: false,
	staffOnly: true,
	execute(message) {
		message.channel.send('Pong.');
	},
};