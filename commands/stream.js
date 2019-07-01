exports.run = async (bot, msg, args) => {
	// Private command.
	if (!msg.member.roles.find(r => r.name === process.env.ROLE)) return;

	// Wrong syntax:
	if (!args[0]) return msg.reply(`Uso: ${process.env.PREFIX}stream usuario1 [&usuario2 &usuario3...] [*descripción]`);

	let multistream = false;		
	let message = `${args[0]}/`;

	// Traverse the array and form the correct message.
	for (let i = 1; i < args.length; i++) {
		if (args[i].charAt(0) == '&') {		// Add streamers.
			message += `${args[i].substring(1)}/`
			multistream = true;
		}
		else if (args[i].charAt(0) == '*') {	// Add description.
			message += `\n${args[i].substring(1)} ${args.slice(i + 1).reduce((a, b) => `${a} ${b}`)}`;
		}
		else break;
	}

	let host = (multistream ? "https://multistre.am/" : "https://www.twitch.tv/");

	try {
		// Try to send the message to the streamings channel.
		let streamChannel = getStreamChannel(msg.channel.guild.channels);
		await streamChannel.send("Estamos en directo:\n" + host + message);

	} catch (e) {
		// Tells the user if there has been an error.
		// Deletes the user's message and the reply after 10s.
		if (typeof e == 'string') {
			let reply = await msg.reply(e);
			msg.delete(10000);
			msg.channel.lastMessage.delete(10000);
		}
		else console.log(e.stack);
	}
}

function getStreamChannel(channels) {
	// Get all server channels and check their name.
	for (let c of channels.array())
		if (c.name == process.env.STREAM_CHANNEL)
			return c;
	throw "no se ha encontrado un canal de streamings adecuado."
}
