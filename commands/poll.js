// Thanks to RetroDevelopment

const Discord = require('discord.js');
const Poll = require('../objects/ObjectPoll.js');

require('dotenv').config();

exports.run = async (bot, msg, args) => {
	if (!msg.member.roles.find(r => r.name === process.env.MIN_ROLE)) return;

	if (!args[0]) return msg.channel.send("Uso: " + process.env.PREFIX + "poll nombre");

	const embed = new Discord.RichEmbed()
		.setColor(0xffffff)		
		.setTitle(args[0])
		.setFooter(`Encuesta creada por ${msg.author.username}`)
		// .setDescription(args.join(' '))

	let options = [];

	if (args.length < 3)
		options = ["Sí", "No"];
	else {
		options = args.slice(1, args.length);
		for (i = 0; i < options.length; i++)
			options[i] = options[i].replace(/_/g, " ");
	}

	try {
		let poll = new Poll(args[0], options);

		for (i = 0; i < poll.options.length; i++)
			embed.addField(poll.options[i], poll.votes[i]);

		let reply = await msg.channel.send(embed);

	} catch(e) {
		msg.reply(e.stack);
	}

	// msg.delete({timeout: 50});
}
