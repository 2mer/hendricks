import { PluginContext } from 'hendricks-pdk';
import parseCodeblock from './util/parseCodeblock';
import { codeblockHandlers } from '.';
import { errorEmoji } from './emoji';

export default function codeblockRunner({ client, logger }: PluginContext) {
	client.on('messageReactionAdd', async (messageReaction, user) => {
		logger.verbose('message reaction add');

		const message = messageReaction.message;
		const emoji = messageReaction.emoji.name;
		const channel = message.channel;
		const userId = user.id;
		const guildId = message.guildId;

		// ignore self reactions
		if (userId === client.user!.id) {
			return;
		}

		if (!guildId) return;

		if (!message.content) return;

		const extracted = parseCodeblock(message.content);
		if (!extracted) return;

		codeblockHandlers.forEach((handler) => {
			if (handler.test.test(extracted.lang)) {
				handler
					.run({
						channel,
						client,
						code: extracted.code,
						emoji,
						guildId,
						sourceMessage: message,
						userId,
					})
					.catch((err) => {
						message.reply(
							`${errorEmoji} Failed execution of handler: ${handler.id}`
						);
						logger.error(err);
					});
			}
		});
	});
}
