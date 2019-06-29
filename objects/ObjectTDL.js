let Task = require('./ObjectTask.js');

let fs = require('fs');

class TDL {
	constructor(server) {
		this.tasks = [];
		this.server = server;
	}

	remove(pos) {
		this.tasks.splice(pos, 1);
		this.save();
	}

	removeAll() {
		this.tasks.splice(0, this.tasks.length);	// Using this.tasks = [] gives problems.
		this.save();
	}

	add(task) {
		this.tasks.push(new Task(task));
		this.save();
	}

	changePrio(pos, newPrio) {
		let task = this.tasks[pos];
		task.setPriority(newPrio);
		this.remove(this.tasks.indexOf(task), 1);

		// Reorder list:
		for (var i = 0; i < this.tasks.length; i++)
			if (this.tasks[i].prio < newPrio)
				break;

		this.tasks.splice(i, 0, task);
		this.save();
	}

	save() {
		fs.writeFile(`./tdl/${this.server}.json`, JSON.stringify(this), function(err) {
			if (err) {
				console.log(err);
				throw err;
			}
		});
	}

	static fromJSON(json) {
		let tdl = new TDL("");
		Object.assign(tdl, json);
		for (let task of tdl.tasks)
			tdl.tasks[tdl.tasks.indexOf(task)] = Task.fromJSON(task);
		return tdl;
	}
};

module.exports = TDL;
