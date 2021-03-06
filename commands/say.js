exports.run = async (bot, msg, args) => {
	// Private command.
	if (!msg.member.roles.find(r => r.name === process.env.ROLE)) return;

	// Wrong syntax:
	if (!args[0] || (args[0].charAt(0) == "#" && !args[1])) {
		msg.delete();
		let reply = msg.reply(`uso: ${process.env.PREFIX}say [canal] mensaje.`);
		return reply.delete(10000)
	}

	try {
		// Decide to which channel send the message:
		let channel = msg.channel;
		let text = args[0];
		if (args[0].startsWith("<#") && args[0].endsWith(">")) {
			channel = getDestChannel(msg.channel.guild.channels.array(), args[0].slice(2, args[0].length - 1));
			text = args.shift();
		}

		// Delete original message and send as bot.
		msg.delete();
		channel.send(args.reduce((a, b) => `${a} ${b}`));

	} catch (e) {
		// Tells the user if they've made a mistake.
		// Deletes the user's message, and the reply after 10s.
		if (typeof e == 'string') {
			let reply = await msg.reply(e);
			msg.delete(0);
			reply.delete(10000);
		}
		// In case it's an unknown error:
		else {
			console.log(e.stack);
			let reply = await msg.reply("error al enviar el mensaje.");
			msg.delete(0);
			reply.delete(10000);
		}
	}
}

function getDestChannel(channels, channelID) {
	for (let ch of channels)
		if (ch.id == channelID) return ch;
	throw "no existe el canal solicitado."
}
