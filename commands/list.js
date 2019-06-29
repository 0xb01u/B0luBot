const Discord = require('discord.js');

require('dotenv').config();

let P = process.env.PREFIX;

exports.run = async (bot, msg, args) => {
	// Private command.
	if (!msg.member.roles.find(r => r.name === process.env.ROLE)) return;

	msg.reply(`Comandos privados:\n`
		+ `${P}list -> Lista de comandos.\n`
		+ `${P}poll -> Gesión de encuestas.\n`
		+ `${P}stream -> Creación de mensajes de streams.\n`
		+ `${P}serverinfo -> Mensaje (privado) de información del servidor.\n`
		+ `${P}tdl -> Gestión de lista de cosas por hacer.\n`);
}