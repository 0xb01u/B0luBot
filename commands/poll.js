const Discord = require('discord.js');
const Poll = require('../objects/ObjectPoll.js');	// Poll class.
const fs = require('fs');

exports.run = async (bot, msg, args) => {
	// Private command.
	if (!msg.member.roles.find(r => r.name === process.env.ROLE)) return;

	// Wrong syntax:
	if (!args[0]) return msg.reply(`uso incorrecto.\nPara recibir ayuda, usa ${process.env.PREFIX}poll help`);

	// Replaces all underscores with spaces.
	for (let i = 0; i < args.length; i++)
		args[i] = args[i].replace(/_/g, " ");

	// Check if ../polls exist
	if (!fs.existsSync("./polls")) fs.mkdirSync("./polls");

	let poll = {}	// Poll object.
	let server = `${msg.channel.guild.name}#${msg.channel.guild.id}`	// Server identifier.
	let last = Poll.getNextNumber(server) - 1;	// Last poll in the server.
	let indexPath = `./polls/${server}/`;
	let requirePath = `.${indexPath}`;
	let json = {}	// JSON file path to read poll from.

	try {
		// Poll action:
		switch (args[0]) {
			case "help":
				msg.reply(`uso: ${process.env.PREFIX}poll modo [argumentos]\n`
					+ "Modos:\n"
					+ `${process.env.PREFIX}poll NOMBRE -> Crea una nueva encuesta con el nombre especificado.\n`
					+ `${process.env.PREFIX}poll view [numPoll] -> Muestra al encuesta número numPoll.\n`
					+ `${process.env.PREFIX}poll vote numOpción [numPoll] -> Vota la opción numOpción de la encuesta número numPoll.`
					+ " (solo se permite un voto por usuario; volver a votar eliminará el voto anterior).\n"
					+ `${process.env.PREFIX}poll close [numPoll] -> Cierra la encuesta número numPoll.\n`
					+ `${process.env.PREFIX}poll timer Tiempo[d/h/m] -> Fija el tiempo de vida de la encuesta a Tiempo días/horas/minutos `
					+ "(si no se especifica, se interpretará como horas).\n"
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
				if (isNaN(parseInt(args[1])))
					throw `uso: ${process.env.PREFIX} pollvote númeroOpción [númeroPoll]`;

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
				json = requirePath + (args[1] ? args[1] : last) + ".json";
				delete require.cache[require.resolve(json)];

				poll = Poll.fromJSON(require(json));
				poll.close();
				break;

			case "timer":
				if (!args[1]) throw `uso: ${process.env.PREFIX}poll timer tiempo[d/h/m].`;

				// Refresh poll file.
				json = requirePath + last + ".json";				
				delete require.cache[require.resolve(json)];

				poll = Poll.fromJSON(require(json));

				if (!poll.open) throw "la última encuesta ya está cerrada."

				let time = 1000;
				// Get time in ms:
				switch (args[1][args[1].length - 1]) {
					case 'd': time *= 24;
					case 'h': time *= 60;
					case 'm': time *= 60 * parseFloat(args[1].substring(0, args[1].length - 1));
						break;
					default: time *= 3600 * parseFloat(args[1]);	// Default = hours.
				}

				return setTimeout(function() {
						poll.close();
						msg.channel.send("Encuesta cerrada:");
						sendPoll(poll, msg);
					}, time);

			case "purge":	// Permanently delete polls from the system.
				let total = last + 1;
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
			reply.delete(10000);
			msg.delete(10000);
		}
		else {
			console.log(e.stack);
			let reply = await msg.reply("error al acceder a las encuestas.");
			reply.delete(10000);
			msg.delete(10000);
		}
	}
}

// Poll formater.
async function sendPoll(poll, msg) {
	const embed = new Discord.RichEmbed()
		.setColor(poll.open ? 0xffffff : 0xff0000)		
		.setTitle(`(# ${poll.number + 1}) ${poll.name}` + (poll.open ? ":" : " [CERRADA]:"));
		// .setDescription(args.join(' '))

	for (let i = 0; i < poll.options.length; i++)
		embed.addField(`${(i + 1)}.- ${poll.options[i]}`, `${poll.votes[i].length}`
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
}

// Thanks to RetroDevelopment
