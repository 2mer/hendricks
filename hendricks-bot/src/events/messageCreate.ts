import { Client, Message } from 'discord.js';
import { runEmoji } from '../constants';
import Event from '../types/Event';
import parseCodeblock from '../util/parseCodeblock';

export default {
	name: 'messageCreate',
	once: false,
	async execute(client: Client, ...args: any[]) {
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
		const extracted = parseCodeblock(message.content);
		if (!extracted) {
			return;
		}

		await message.react(runEmoji);
	},
} as Event;
