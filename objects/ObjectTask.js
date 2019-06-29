class Task {
	constructor(task) {
		this.name = task;
		this.prio = 0;
		this.date = new Date();
		this.asignee = [];
		this.details = "";
	}

	setPriority(prio) {
		this.prio = prio;
	}

	addAsignee(userName) {
		if (this.asignee.includes(userName)) throw "ya estás asignado a esa tarea."
		this.asignee.push(userName);
	}

	removeAsignee(userName) {
		if (!this.asignee.includes(userName)) throw "no estás asignado a esa tarea."
		if (this.asignee.length == 1) this.asignee = [];
		else this.asignee.splice(this.asignee.indexOf(userName), 1);
	}

	setDetails(details) {
		this.details = details;
	}

	stringDate() {
		return `${this.date.getDate()}/${this.date.getMonth() + 1}/${this.date.getFullYear()}`;
	}

	static fromJSON(json) {
		let task = new Task("");
		Object.assign(task, json);
		task.date = new Date(task.date);
		return task;
	}
};

module.exports = Task;
