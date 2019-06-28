// Thanks to RetroDevelopment

const Discord = require('discord.js');
const Poll = require('../objects/ObjectPoll.js');

require('dotenv').config();

exports.run = async (bot, msg, args) => {
	if (!msg.member.roles.find(r => r.name === process.env.MIN_ROLE)) return;

	if (!args[0]) return msg.reply("Uso incorrecto.\nPara recibir ayuda, usa " + process.env.PREFIX + "poll help");

	for (let i = 0; i < args.length; i++)
		args[i] = args[i].replace(/_/g, " ");

	let poll = {}
	let json = {}

	try {
		switch (args[0]) {
			case "help":
				msg.reply("Uso: " + process.env.PREFIX + "poll modo argumentos\n"
					+ "Modos: NOMBRE (crear nueva); vote (votar existente); close (cerrar existente)\n"
					+ "Argumentos: NOMBRE [Opción1, Opción2, ...]; vote númeroOpción [númeroPoll]; close [númeroPoll]");
				break;

			case "vote":
				if (!args[1]) msg.reply("Uso: " + process.env.PREFIX + "poll vote númeroOpción [númeroPoll]");

				json = "../polls/" + (args[2] ? args[2] : Poll.getNextNumber() - 1) + ".json"
				delete require.cache[require.resolve(json)];

				poll = Poll.fromJSON(require(json));
				poll.vote(args[1]);
				break;

			case "close":
				json = "../polls/" + (args[1] ? args[1] : Poll.getNextNumber() - 1) + ".json"
				delete require.cache[require.resolve(json)];

				poll = Poll.fromJSON(require(json));
				poll.close();
				break;

			default:
				let options = [];

				if (args.length < 2)
					options = ["Sí", "No"];
				else
					options = args.slice(1, args.length);

				poll = new Poll(args[0], options);
				poll.save();
				break;
		}

		sendPoll(poll, msg);

	} catch(e) {
		msg.reply(e);
	}
}

async function sendPoll(poll, msg) {
	const embed = new Discord.RichEmbed()
		.setColor(poll.open ? 0xffffff : 0xff0000)		
		.setTitle(poll.name + " (#" + poll.number + ")" + (poll.open ? "" : " [CERRADA]"))
		.setFooter(`Encuesta creada por ${msg.author.username}`)
		// .setDescription(args.join(' '))

		for (i = 0; i < poll.options.length; i++)
			embed.addField((i + 1) + ": " + poll.options[i], poll.votes[i] +
				" (" + parseInt((poll.votes[i] / (poll.getVotes() ? poll.getVotes() : 1))*100) + "%)");

		let reply = await msg.channel.send(embed);

	// msg.delete({timeout: 50});
}
