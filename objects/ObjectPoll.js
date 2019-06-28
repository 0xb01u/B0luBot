let fs = require('fs');

class Poll {
	constructor(name, options) {
		if (options.length < 2) throw "cantidad de opciones insuficiente."
		this.number = Poll.getNextNumber();
		this.open = true;
		this.name = name;
		this.options = options;
		this.votes = [];
		for (const e in options) this.votes.push(0);
		// TODO: llevar la cuenta de quién ha votado.
	}

	close() {
		if (!this.open) throw "la encuesta ya está cerrada."
		this.open = false;
		this.save();
	}

	vote(option) {
		if (!this.open) throw "encuesta cerrada.";
		if (option > this.options.length || option < 1) throw "opción inválida.";

		this.votes[option - 1]++;
		this.save();
	}

	save() {
		fs.writeFile("./polls/" + this.number + ".json", JSON.stringify(this), function(err) {
			if (err) {
				console.log(err);
				throw err;
			}
		})
	}

	static getNextNumber() {
		let fileList = fs.readdirSync("./polls");
		for (let i = 0; ; i++) {
			if (!fileList.includes(i + ".json"))
				return i;
		}
	}

	static fromJSON(obj) {
		let poll = new Poll("", [0, 0]);
		Object.assign(poll, obj);
		return poll;
	}
};

module.exports = Poll;
