import { runFromReaction } from './util/codeRunner';
import { errorEmoji, runEmoji } from '../../constants';
import logger from '../../logger';
import client from '@hendricks/client';

export default function codeblockRunner() {
	client.on('messageReactionAdd', async (messageReaction, user) => {
		logger.verbose('message reaction add');

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
			const ret = await runFromReaction(
				client,
				message.guildId!,
				channel,
				message.id,
				user.id,
				message.content!,
				message
			);
			if (ret) {
				const error = ret.error;
				if (error) {
					await message.reply(
						errorEmoji + ' Run error: ```' + error + '```'
					);
					return;
				}
			}
		}
	});
}
