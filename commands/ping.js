module.exports = {
	name: 'ping',
	description: 'Ping!',
	args: false,
	execute(message) {
		message.channel.send('Pong.');
	},
};