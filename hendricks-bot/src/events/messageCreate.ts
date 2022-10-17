import { Client, Message } from 'discord.js';
import { extractCode } from '../codeRunner';
import { runEmoji } from '../constants';
import Scope from '../types/Scope';
import Event from '../types/Event';

export default {
	name: 'messageCreate',
	once: false,
	async execute(scope: Scope, client: Client, ...args: any[]) {
		const message = args[0] as Message;
		const user = message.author;
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
