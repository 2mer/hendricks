import { Client, Message } from "discord.js";
import { run, extractCode } from "../codeRunner";
import { runEmoji } from "../constants";
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
		const guildId = message.guildId;

		if (guildId == null) {
			message.reply('guildId is null. Aborting.');
			return;
		}

		if (client.user == null) {
			message.reply('client.user is null. Aborting.');
			return;
		}

		// ignore self messages
		if (user.id == client.user.id) {
			return;
		}

		// extract the code from the message
		const extracted = extractCode(message.content);
		if (extracted == null) {
			return;
		}

		await message.react(runEmoji);
	},
} as Event;
