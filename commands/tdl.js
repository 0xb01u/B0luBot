const Discord = require('discord.js');
const TDL = require('../objects/ObjectTDL.js');	// To-do list class.

require('dotenv').config();

exports.run = async (bot, msg, args) => {
	// Private command.
	if (!msg.member.roles.find(r => r.name === process.env.ROLE)) return;

	let tdl = {}	// To-do list object.
	let server = `${msg.channel.guild.name}#${msg.channel.guild.id}`	// Server identifier.
	let json = `../tdl/${server}.json`	// JSON file path to read list from.

	try {;
		// Tdl action:
		if (!args[0]) return sendList(TDL.fromJSON(require(json)), msg);	// Show tdl.

		switch (args[0]) {
			case "help":
				msg.reply(`uso: ${process.env.PREFIX}tdl [modo] [tarea] [argumentos]\n`
					+ "Modos:\n"
					+ `${process.env.PREFIX}tdl -> Muestra la lista de tareas por hacer.\n`
					+ `${process.env.PREFIX}tdl NOMBRE -> Añade una nueva tarea NOMBRE a la lista, con prioridad 0\n.`
					+ `${process.env.PREFIX}tdl view numTarea -> Muestra los detalles de la tarea número numTarea.\n`
					+ `${process.env.PREFIX}tdl prio numTarea nuevaPrioridad -> Cambia la prioridad de la tarea número numTarea a nuevaPrioridad.\n`
					+ `${process.env.PREFIX}tdl join numTarea -> Te añade como encargado de la tarea número numTarea.\n`
					+ `${process.env.PREFIX}tdl disjoin numTarea -> Te quita como encargado de la tarea número numTarea.\n`
					+ `${process.env.PREFIX}tdl detail numTarea -> Actualiza los detalles de la tarea número numTarea.\n`
					+ `${process.env.PREFIX}tdl remove numTarea -> Borra la tarea número numTarea de la lista.\n`
					+ `${process.env.PREFIX}tdl removeAll -> Borra todas las tareas de la lista.\n`);
				break;

			case "view":
				tdl = TDL.fromJSON(require(json));

				if (isNaN(parseInt(args[1]))
					|| args[1] < 1 || args[1] > tdl.tasks.length)
					throw "número de tarea incorrecto.";

				sendTask(tdl.tasks[args[1] - 1], msg);
				break;

			case "prio":
				if (isNaN(parseInt(args[1]) + parseInt(args[2])))
					throw `uso: /${process.env.PREFIX}tdl prio numTarea nuevaPrioridad.`

				tdl = TDL.fromJSON(require(json));
				if (args[1] < 1 || args[1] > tdl.tasks.length)
					throw "número de tarea incorrecto."

				tdl.changePrio(args[1] - 1, args[2]);
				sendList(tdl, msg);
				break;

			case "join":
				tdl = TDL.fromJSON(require(json));

				if (isNaN(parseInt(args[1]))
					|| args[1] < 1 || args[1] > tdl.tasks.length)
					throw "número de tarea incorrecto."

				tdl.tasks[args[1] - 1].addAsignee(msg.author.username);
				tdl.save();
				msg.channel.send(`Añadido ${msg.author.username} como encargado de la tarea ${args[1]}.`);
				break;

			case "disjoin":
				tdl = TDL.fromJSON(require(json));

				if (isNaN(parseInt(args[1]))
					|| args[1] < 1 || args[1] > tdl.tasks.length)
					throw "número de tarea incorrecto."

				tdl.tasks[args[1] - 1].removeAsignee(msg.author.username);
				tdl.save();
				msg.channel.send(`Eliminado ${msg.author.username} como encargado de la tarea ${args[1]}.`);
				break;

			case "detail":
				let detail = (args[2] ? args.slice(2, args.length).reduce(((a, b) => `${a} ${b}`)) : "");

				tdl = TDL.fromJSON(require(json));

				if (isNaN(parseInt(args[1]))
					|| args[1] < 1 || args[1] > tdl.tasks.length)
					throw "número de tarea incorrecto."

				tdl.tasks[args[1] - 1].setDetails(detail);
				tdl.save();
				msg.channel.send(`Actualizados los detalles la tarea ${args[1]}.`);
				break;

			case "remove":
				tdl = TDL.fromJSON(require(json));

				if (isNaN(parseInt(args[1]))
					|| args[1] < 1 || args[1] > tdl.tasks.length)
					throw "número de tarea incorrecto."

				tdl.remove(args[1] - 1);
				msg.channel.send(`Tarea eliminada.`);
				break;

			case "removeAll":
				tdl = TDL.fromJSON(require(json));

				tdl.removeAll();
				msg.channel.send(`Todas las tareas eliminadas.`);
				break;

			default:
				// Check if ../tdl exist
				let fs = require('fs');
				if (!fs.existsSync("../tdl")) fs.mkdirSync("../tdl");

				// Create or load list:
				if (fs.existsSync(json.substring(1, json.length)))	// The path is different (current folder).
					tdl = TDL.fromJSON(require(json));
				else tdl = new TDL(server);

				tdl.add(args.reduce(((a, b) => `${a} ${b}`)));
				sendList(tdl, msg);
				break;
		}

	} catch (e) {
		// Tells the user if they've made a mistake.
		// Deletes the user's message and the reply after 10s.
		if (typeof e == 'string') {
			let reply = await msg.reply(e);
			reply.delete(10000);
			msg.delete(10000);
		}
		// In case it's an unknown error:
		else {
			console.log(e.stack);
			let reply = await msg.reply("error al acceder a la lista de tareas.");
			reply.delete(10000);
			msg.delete(10000);
		}
	}
}

// To-do list formater.
async function sendList(tdl, msg) {
	const embed = new Discord.RichEmbed()
		.setColor(0x00ff80)
		.setTitle("Tareas por hacer:");

	let i = 1;
	for (task of tdl.tasks)
		embed.addField(`${i++}.- ${task.name}`, `Prioridad: ${task.prio}`);

	let reply = await msg.channel.send(embed);
	// Remove earlier messages?
}

// Task formater.
async function sendTask(task, msg) {
	const embed = new Discord.RichEmbed()
		.setColor(0x80ff00)
		.setTitle(task.name)
		.addField(`Prioridad`, `${task.prio}`)
		.addField(`Fecha de inclusión`, `${task.stringDate()}`);

	// Details line is only shown if there are any.
	if (task.details.length > 0)
		embed.addField(`Detalles`, `${task.details}`);

	// Assignees line is only shown if there are any,
	if (task.assignee.length > 0) {
		embed.addField(`Encargados`, `${task.assignee.toString()}`);
	}

	let reply = await msg.channel.send(embed);
}
