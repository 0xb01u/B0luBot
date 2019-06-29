const Discord = require('discord.js');
const Poll = require('../objects/ObjectPoll.js');	// Poll object.

require('dotenv').config();

exports.run = async (bot, msg, args) => {
	if (!msg.member.roles.find(r => r.name === process.env.ROLE)) return;

	if (!args[0]) return msg.reply(`Uso incorrecto.\nPara recibir ayuda, usa ${process.env.PREFIX}poll help`);

	// Replaces all underscores with spaces.
	for (let i = 0; i < args.length; i++)
		args[i] = args[i].replace(/_/g, " ");

	let poll = {}	// Poll object.
	let json = {}	// JSON file to read poll from.
	let server = `${msg.channel.guild.name}#${msg.channel.guild.id}`	// Server identifier.	
	let last = Poll.getNextNumber(server) - 1;	// Last poll in the server.
	let indexPath = `./polls/${server}/`;
	let requirePath = `.${indexPath}`;

	try {
		// Poll action:
		switch (args[0]) {
			case "help":
				msg.reply(`Uso: ${process.env.PREFIX}poll modo [argumentos]\n`
					+ "Modos:\n"
					+ `${process.env.PREFIX}poll NOMBRE -> Crea una nueva encuesta con el nombre especificado.\n`
					+ `${process.env.PREFIX}poll view [numPoll] -> Muestra al encuesta número numPoll.\n`
					+ `${process.env.PREFIX}poll vote numOpción [numPoll] -> Vota la opción numOpción de la encuesta número numPoll.`
					+ " (solo se permite un voto por usuario; volver a votar eliminará el voto anterior).\n"
					+ `${process.env.PREFIX}poll close [numPoll] -> Cierra la encuesta número numPoll.\n`
					+ `${process.env.PREFIX}poll purge [cantidad] -> Elimina del sistema el número especificado de encuestas, `
					+ "empezando por la última. (No se borrarán del chat.)\n"
					+ `${process.env.PREFIX}poll help -> Responde con este mensaje al usuario que lo utilice.\n`
					+ "Si no se especifica numPoll, se entiende que nos referimos a la última encuesta creada.\n"
					+ `Si no se especifica cantidad en ${process.env.PREFIX}poll purge, se eliminarán TODAS las encuestas.`);
				return;

			case "view":
				if (last < 0) throw "no hay encuestas para ver.";

				json = requirePath + (args[1] ? args[1] : last) + ".json";
				delete require.cache[require.resolve(json)];

				poll = Poll.fromJSON(require(json));
				break;

			case "vote":
				if (!args[1]) msg.reply(`Uso: ${process.env.PREFIX} poll vote númeroOpción [númeroPoll]`);

				if (last < 0) throw "no hay encuestas para votar.";

				// Refresh poll file.
				json = requirePath + (args[2] ? args[2] : last) + ".json";
				delete require.cache[require.resolve(json)];

				poll = Poll.fromJSON(require(json));
				poll.vote(args[1], msg.member.displayName);
				break;

			case "close":
				if (last < 0) throw "no hay encuestas para cerrar.";

				// Refresh poll file.
				json = requirePath + (args[1] ? args[1] : Poll.getNextNumber(server) - 1) + ".json";
				delete require.cache[require.resolve(json)];

				poll = Poll.fromJSON(require(json));
				poll.close();
				break;

			case "purge":	// Permanently delete polls from the system.
				let fs = require('fs');

				let total = Poll.getNextNumber(server);
				if (args[1] < 1 || args[1] > total)
					throw "no se puede eliminar esa cantidad de ecuestas.";

				// If no args are given, all polls are deleted.
				let del = args[1] ? args[1] : total;
				for (let i = total - 1; i >= total - del; i--)
					fs.unlink(`${indexPath}${i}.json`, function (err) {
						if (err) throw err;
					})
				return msg.channel.send(`Eliminadas las últimas ${del} encuestas.`);

			default:	// Create new poll.
				let options = [];

				if (args.length < 2)	// Not enough options given.
					options = ["Sí", "No"];
				else
					options = args.slice(1, args.length);

				poll = new Poll(args[0], options, server);
				poll.save();
				break;
		}

		// Print poll.
		sendPoll(poll, msg);

	} catch(e) {
		// Tells the user if they've made a mistake.
		// Deletes the user's message and the reply after 10s.
		if (typeof e == 'string') {
			let reply = await msg.reply(e);
			msg.delete(10000);
			msg.channel.lastMessage.delete(10000);
		}
		else console.log(e.stack);
	}
}

async function sendPoll(poll, msg) {
	const embed = new Discord.RichEmbed()
		.setColor(poll.open ? 0xffffff : 0xff0000)		
		.setTitle(`(# ${poll.number}) ${poll.name}` + (poll.open ? "" : " [CERRADA]"));
		// .setFooter(`Encuesta creada por ${msg.author.username}`)
		// .setDescription(args.join(' '))

	for (let i = 0; i < poll.options.length; i++)
		embed.addField(`${(i + 1)}: ${poll.options[i]}`, `${poll.votes[i].length}`
			// Vote percentage:
			+ ` (${parseInt((poll.votes[i].length / (poll.getVotes() ? poll.getVotes() : 1))*100)}%)`);

	let channel = msg.channel;
	let reply = await channel.send(embed);

	let messages = channel.messages.array();
	// Remove earlier poll embeds.
	for (let i = 0; i < messages.length; i++)
		for (let j = 0; j < messages[i].embeds.length; j++)
			if (messages[i].embeds[j].title == embed.title
				&& messages[i] != reply)
				return messages[i].delete();

	// msg.delete({timeout: 50});	// Delete message that triggered this poll.
}

// Thanks to RetroDevelopment
