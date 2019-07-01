exports.run = async (bot, msg, args) => {
	// Public command.

	// Wrong syntax:
	if (!args[0]) {
		let reply = await msg.reply(`uso: ${process.env.PREFIX}admin (inserte aquí el mensaje a enviar de forma privada a los administradores).`);
		msg.delete();
		return reply.delete(10000);
	}

	try {
		let channel = getAdminChannel(msg.channel.guild.channels);

		channel.send(`@here, <@${msg.author.id}> dice:\n${args.reduce((a, b) => `${a} ${b}`)}`);
		msg.delete();

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

function getAdminChannel(channels) {
	// Get all server channels and check their name.
	for (let c of channels.array())
		if (c.name == process.env.ADMIN_CHANNEL)
			return c;
	throw "no se ha encontrado el canal de administradores.";
}
