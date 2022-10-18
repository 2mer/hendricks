import { Client, Message } from 'discord.js';
import { extractCode } from '../runBlocks/index';
import { runEmoji } from '../constants';
import Event from '../types/Event';

const supportedLanguages = ['js', 'latex'];

export default {
	name: 'messageCreate',
	once: false,
	async execute(client: Client, ...args: any[]) {
		const message = args[0] as Message;
		const user = message.author;
		const guildId = message.guildId;

		if (!guildId) {
			message.reply('guildId is null. Aborting.');
			return;
		}

		if (!client.user) {
			message.reply('client.user is null. Aborting.');
			return;
		}

		// ignore self messages
		if (user.id == client.user.id)
			return;

		// extract the code from the message
		const extracted = extractCode(message.content);
		if (!extracted)
			return;

		if (supportedLanguages.includes(extracted.lang))
			await message.react(runEmoji);
	},
} as Event;
