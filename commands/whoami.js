exports.run = async (bot, msg, args) => {
	// Public command.

	msg.reply(`eres ${msg.author.username}#${msg.author.discriminator}, con ID de discord ${msg.author.id}.`);
}