const Discord = require('discord.js');
const bot = new Discord.Client();

require('dotenv').config();

const token = process.env.TOKEN;
const PREFIX = process.env.PREFIX;
const ROLE = process.env.MIN_ROLE;

bot.on('ready', () => {
	console.log('BoluBot online.');
});

bot.on('message', msg => {

	if (!msg.content.startsWith(PREFIX)) return;
	if (!msg.member.roles.find(r => r.name === ROLE)) return;
	if (msg.author.bot) return;

	let args = msg.content.substring(PREFIX.length).split(" ");
	let cmd = args.shift().toLowerCase();

	try {
		delete require.cache[require.resolve(`./commands/${cmd}.js`)];

		let commandFile = require(`./commands/${cmd}.js`);
		commandFile.run(bot, msg, args);

	} catch (e) {
		console.log(e.stack);
	}
});


bot.login(token);
