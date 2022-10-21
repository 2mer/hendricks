interface Task {
	guildId: string;
	id: string;
	prompt: string;
	task: string;
	author: string;
}

const idToTask = new Map<string, Task>();

function key(guildId: string, id: string) {
	return `${guildId}-${id}`;
}

function add(task: Task) {
	idToTask.set(key(task.guildId, task.id), task);
}

function get(guildId: string, id: string) {
	return idToTask.get(key(guildId, id));
}

export default {
	add,
	get,
};
