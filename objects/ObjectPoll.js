let fs = require('fs');

class Poll {
	// Constructor from poll name and choices.
	constructor(name, options, server) {
		if (options.length < 2) throw "cantidad de opciones insuficiente."
		this.number = Poll.getNextNumber(server);
		this.open = true;
		this.name = name;
		this.options = options;
		this.votes = [];
		for (const e in options) this.votes.push([]);
		this.server = server;
	}

	// Sets the poll as closed.
	close() {
		if (!this.open) throw "la encuesta ya está cerrada."
		this.open = false;
		this.save();
	}

	// Votes for a given choice.
	vote(option, member) {
		if (!this.open) throw "encuesta cerrada.";
		if (option > this.options.length || option < 1) throw "opción inválida.";

		// Remove the member's previous vite (if any).
		for (let i = 0; i < this.votes.length; i++) {
			let e = this.votes[i]
			if (e.includes(member))
				if (e.length = 1) this.votes[i] = [];
				else this.votes.splice(this.votes.indexOf(member), 1);
		}
		// Update votes.
		this.votes[option - 1].push(member);
		this.save();
	}

	// Total number of votes.
	getVotes() {
		return this.votes.reduce((a, b) => a.length + b.length);
	}
	// Votes for the most voted option.
	getMaxVote() {
		return Math.max(...this.votes.map(function(x) {
			x.length;
		}));
	}

	// Saves poll as a JSON file.
	save() {
		let dir = `./polls/${this.server}`;
		if (!fs.existsSync(dir)) fs.mkdirSync(dir);
		fs.writeFile(`${dir}/${this.number}.json`, JSON.stringify(this), function(err) {
			if (err) {
				console.log(err);
				throw err;
			}
		});
	}

	// Returns the number for the next poll.
	static getNextNumber(server) {	
		let dir = `./polls/${server}`;
		if (!fs.existsSync(dir))
			fs.mkdirSync(dir);

		let fileList = fs.readdirSync(dir);
		for (let i = 0; ; i++) {
			if (!fileList.includes(`${i}.json`))
				return i;
		}
	}

	// Creates poll from a JSON file.
	static fromJSON(json) {
		let poll = new Poll("", [0, 0], ".temp");
		Object.assign(poll, json);
		return poll;
	}
};

module.exports = Poll;
