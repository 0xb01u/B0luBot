let P = process.env.PREFIX;

exports.run = async (bot, msg, args) => {
	// Private command.
	if (!msg.member.roles.find(r => r.name === process.env.ROLE)) return;

	msg.reply(`Comandos privados:\n`
		+ `${P}admin -> Envía un mensaje privado a los administradores del servidor.\n`
		+ `${P}list -> Lista de comandos.\n`
		+ `${P}say -> El bot envía el mensaje especificado al canal especificado.\n`
		+ `${P}poll -> Gesión de encuestas.\n`
		+ `${P}serverinfo -> Mensaje (privado) de información del servidor.\n`
		+ `${P}stream -> Creación de mensajes de streams.\n`
		+ `${P}sugerencia -> Envía sugerencias sobre el bot a su administrador.\n`
		+ `${P}tdl -> Gestión de lista de cosas por hacer.\n`
		+ `${P}whoami -> Te dice tu ID numérica de discord.`);
}
