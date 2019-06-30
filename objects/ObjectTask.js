class Task {
	constructor(task) {
		this.name = task;
		this.prio = 0;
		this.date = new Date();
		this.assignee = [];
		this.details = "";
	}

	setPriority(prio) {
		this.prio = prio;
	}

	addAsignee(userName) {
		if (this.assignee.includes(userName)) throw "ya estás asignado a esa tarea."
		this.assignee.push(userName);
	}

	removeAsignee(userName) {
		if (!this.assignee.includes(userName)) throw "no estás asignado a esa tarea."
		if (this.assignee.length == 1) this.assignee = [];
		else this.assignee.splice(this.assignee.indexOf(userName), 1);
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
