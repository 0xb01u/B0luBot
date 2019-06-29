const Discord = require('discord.js');
const Poll = require('../objects/ObjectPoll.js');	// Poll object.

require('dotenv').config();

exports.run = async (bot, msg, args) => {
	if (!msg.member.roles.find(r => r.name === process.env.MIN_ROLE)) return;

	if (!args[0]) return msg.reply("Uso incorrecto.\nPara recibir ayuda, usa " + process.env.PREFIX + "poll help");

	// Replaces all underscores with spaces.
	for (let i = 0; i < args.length; i++)
		args[i] = args[i].replace(/_/g, " ");

	let poll = {}	// Poll object.
	let json = {}	// JSON file to read poll from.

	try {
		// Poll action:
		switch (args[0]) {
			case "help":
				msg.reply("Uso: " + process.env.PREFIX + "poll modo [argumentos]\n"
					+ "Modos: NOMBRE (crear nueva); view (ver existente); vote (votar existente); close (cerrar existente)\n"
					+ "Argumentos: NOMBRE [Opción1, Opción2, ...]; view [númeroPoll]; vote númeroOpción [númeroPoll]; close [númeroPoll]\n"
					+ "Si no se especifica el número de la encuesta (númeroPoll), se entiende que nos referimos a la última creada.");
				break;

			case "view":
				json = "../polls/" + (args[1] ? args[1] : Poll.getNextNumber() - 1) + ".json"
				delete require.cache[require.resolve(json)];

				poll = Poll.fromJSON(require(json));
				break;

			case "vote":
				if (!args[1]) msg.reply("Uso: " + process.env.PREFIX + "poll vote númeroOpción [númeroPoll]");

				// Refresh poll file.
				json = "../polls/" + (args[2] ? args[2] : Poll.getNextNumber() - 1) + ".json"
				delete require.cache[require.resolve(json)];

				poll = Poll.fromJSON(require(json));
				poll.vote(args[1], msg.member.displayName);
				break;

			case "close":
				// Refresh poll file.
				json = "../polls/" + (args[1] ? args[1] : Poll.getNextNumber() - 1) + ".json"
				delete require.cache[require.resolve(json)];

				poll = Poll.fromJSON(require(json));
				poll.close();
				break;

			default:	// Create new poll.
				let options = [];

				if (args.length < 2)	// Not enough options given.
					options = ["Sí", "No"];
				else
					options = args.slice(1, args.length);

				poll = new Poll(args[0], options);
				poll.save();
				break;
		}

		// Print poll.
		sendPoll(poll, msg);

	} catch(e) {
		typeof e == 'string' ? msg.reply(e) : console.log(e.stack);
	}
}

async function sendPoll(poll, msg) {
	const embed = new Discord.RichEmbed()
		.setColor(poll.open ? 0xffffff : 0xff0000)		
		.setTitle(poll.name + " (#" + poll.number + ")" + (poll.open ? "" : " [CERRADA]"))
		.setFooter(`Encuesta creada por ${msg.author.username}`)
		// .setDescription(args.join(' '))

	for (let i = 0; i < poll.options.length; i++)
		embed.addField((i + 1) + ": " + poll.options[i], poll.votes[i].length +
			// Vote percentage:
			" (" + parseInt((poll.votes[i].length / (poll.getVotes() ? poll.getVotes() : 1))*100) + "%)");

	let channel = msg.channel;
	let reply = await msg.channel.send(embed);

	let messages = channel.messages.array();
	// Remove earlier poll embeds.
	for (let i = 0; i < messages.length; i++)
		for (let j = 0; j < messages[i].embeds.length; j++)
			if (messages[i].embeds[j].title == embed.title
				&& messages[i] != reply)
				return messages[i].delete(0);

	// msg.delete({timeout: 50});	// Delete message that triggered this poll.
}

// Thanks to RetroDevelopment
