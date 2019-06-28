class Poll {
	constructor(name, options) {
		if (options.length < 2) throw "Cantidad de opciones insuficiente."
		this.open = true;
		this.name = name;
		this.options = options;
		this.votes = [];
		for (const e in options) this.votes.push(0);
		// TODO: llevar la cuenta de quién ha votado.
	}

	close() { this.open = false; }

	vote(option) {
		if (!open) throw "Encuesta cerrada.";
		if (option > options.length || option < 1) throw "Opción inválida.";

		votes[option]++;
	}
};

module.exports = Poll;
