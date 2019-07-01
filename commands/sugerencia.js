exports.run = async (bot, msg, args) => {
	// Public command.

	// Wrong syntax:
	if (!args[0]) {
		let reply = await msg.reply(`uso: ${process.env.PREFIX}sugerencia (inserte aquí su sugerencia).`);
		msg.delete(30000);
		return reply.delete(30000);
	}

	// Send (privately) the suggestion to the bot's manager.
	bot.users.get(process.env.GOD_USER_ID)
		.send(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) sugiere:\n`
			+ args.reduce((a, b) => `${a} ${b}`));
}
