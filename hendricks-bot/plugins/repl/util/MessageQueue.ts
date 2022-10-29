import { Message, ThreadChannel } from 'discord.js';

export default class MessageQueue {
	message: Message | null = null;
	queued: string[] = [];
	running = false;
	thread: ThreadChannel;

	constructor({ thread }: { thread: ThreadChannel }) {
		this.thread = thread;
	}

	push(...items: string[]) {
		this.queued.push(...items);

		if (!this.running) {
			this.run();
		}
	}

	async run() {
		this.running = true;

		const prevText = this.message
			? '```' + this.message.content.replace(/```/g, '')
			: '```';
		const items = this.queued.splice(0, this.queued.length);
		const newText = [prevText, ...items].join('\n') + '```';

		if (!this.message) {
			this.message = await this.thread.send(newText);
		} else {
			this.message.edit(newText);
		}

		if (this.queued.length) {
			await this.run();
		} else {
			this.running = false;
		}
	}

	clear() {
		this.message = null;
	}
}
