exports.run = async (bot, msg, args) => {
	// Private command.
	if (!msg.member.roles.find(r => r.name === process.env.ROLE)) return;

	try {
		let infoChannel = getInfoChannel(msg.channel.guild.channels);

		// Get pinned message that starts with "INFO:\n" and re-send it.
		for (let m of (await infoChannel.fetchPinnedMessages()).array())
			if (m.content.startsWith("INFO:\n"))
				return msg.channel.send(m.content.substring(6));
			
		throw "no se ha encontrado un mensaje de información adecuado.";
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

function getInfoChannel(channels) {
	// Get all server channels and check their name.
	for (let c of channels.array())
		if (c.name == process.env.INFO_CHANNEL_PRIV)
			return c;
	throw "no se ha encontrado el canal de información.";
}
