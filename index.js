const Discord = require('discord.js');
const bot = new Discord.Client();

require('dotenv').config();

const token = process.env.TOKEN;
const PREFIX = process.env.PREFIX;
const ROLE = process.env.MIN_ROLE;
const GOD = process.env.GOD_USER_ID;

// Startup message:
bot.on('ready', () => {
	console.log('BoluBot online.');
});

bot.on('message', msg => {
	// Do not attend bots.
	if (msg.author.bot) return;

	// If sent to the bot directly, redirect to the bot manager.
	if (msg.channel.type === "dm")
		return bot.users.get(GOD)
				.send(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) me dice:\n${msg.content}`);


	// Only allow messages that start with the prefix from users with a valid role.
	if (!msg.content.startsWith(PREFIX)) return;
	if (!msg.member.roles.find(r => r.name === ROLE)) return;

	// Split as an array of arguments.
	let args = msg.content.substring(PREFIX.length).split(" ");
	let cmd = args.shift().toLowerCase();

	try {
		// Refresh command script.
		delete require.cache[require.resolve(`./commands/${cmd}.js`)];

		// Load and run command script.
		let commandFile = require(`./commands/${cmd}.js`);
		commandFile.run(bot, msg, args);

	} catch (e) {
		console.log(e.stack);
	}
});


bot.login(token);
