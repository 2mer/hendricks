import { Client, Message } from "discord.js";
import run from "../codeRunner";
import { ClientExtras } from "../extra";
import Event from "./event";

export default {
	name: 'messageCreate',
	once: false,
	async execute(extras: ClientExtras, client: Client, ...args: any[]) {
		const message = args[0] as Message;
		const user = message.author;
		const channel = message.channel;
		const content = message.content;

		if (client.user == null) {
			message.reply('client.userId is null. Aborting.');
			return;
		}

		if (user.id == client.user.id) {
			return
		}

		const lines = content.split(/\n\r?/);
		if (lines.length < 2) {
			return;
		}

		const firstLine = lines[0];
		const lastLine = lines[lines.length - 1];
		if (!firstLine.startsWith('```') || lastLine != '```') {
			return;
		}

		let language = firstLine.substring(3);
		if (language != 'js') {
			return;
		}

		const codeLines = lines.slice(1, lines.length - 1);
		const code = codeLines.join('\n');

		await channel.send(`<@${user.id}> Running!`);

		try {
			run(message.guildId!, channel, user.id, code);
		} catch (_e: any) {
			message.reply('there was an error running your code');
		}
	},
} as Event;
