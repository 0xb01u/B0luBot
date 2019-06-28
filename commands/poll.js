// Thanks to RetroDevelopment

const Discord = require('discord.js');



exports.run = async (bot, msg, args) => {
	if (!msg.member.roles.find(r => r.name === "Miembro")) return;

	if (!args[0]) return msg.channel.send("Uso: !poll nombre");

	const embed = new Discord.RichEmbed()
		.setColor(0xffffff)
		.setFooter("Votos: [TBA]")
		.setDescription(args.join(' '))
		.setTitle(`Encuesta creada por ${msg.author.username}`);

	let reply = await msg.channel.send(embed);

	// msg.delete({timeout: 50});
}