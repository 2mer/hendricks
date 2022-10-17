import { Client, MessageReaction, User } from 'discord.js';
import { runFromReaction } from '../codeRunner';
import { errorEmoji, runEmoji } from '../constants';
import Scope from '../types/Scope';
import Event from '../types/Event';

export default {
	name: 'messageReactionAdd',
	once: false,
	async execute(scope: Scope, client: Client, ...args: any[]) {
		console.log('message reaction add');

		const messageReaction = args[0] as MessageReaction;
		const user = args[1] as User;
		const message = messageReaction.message;
		const emoji = messageReaction.emoji.name;
		const channel = message.channel;

		// ignore self reactions
		if (user.id == client.user!.id) {
			return;
		}

		if (message.content == null) {
			return;
		}

		if (emoji == runEmoji) {
			const { error } = await runFromReaction(
				client,
				message.guildId!,
				channel,
				message.id,
				user.id,
				message.content!,
				message
			);
			if (error) {
				await message.reply(
					errorEmoji + ' Run error: ```' + error + '```'
				);
				return;
			}
		}
	},
} as Event;
