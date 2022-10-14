import { Client, Emoji, Message, MessageReaction, User } from "discord.js";
import { run, runFromReaction } from "../codeRunner";
import { errorEmoji, runEmoji } from "../constants";
import { ClientExtras } from "../extra";
import Event from "./event";

export default {
	name: 'messageReactionAdd',
	once: false,
	async execute(extras: ClientExtras, client: Client, ...args: any[]) {
		console.log('message reaction add')

		const messageReaction = args[0] as MessageReaction;
		const user = args[1] as User;
		const message = messageReaction.message;
		const emoji = messageReaction.emoji.name;
		const userId = user.id;
		const messageId = message.id;
		const channel = message.channel;

		// ignore self reactions
		if (user.id == client.user!.id) {
			return;
		}

		if (message.content == null) {
			return;
		}

		if (emoji == runEmoji) {
			const { out, error } = await runFromReaction(client, message.guildId!, channel, message.id, user.id, message.content!, message);
			if (error) {
				await message.reply(errorEmoji + ' Run error: ```' + error + '```');
				return
			}
		}
	},
} as Event;
