import { PluginContext } from 'hendricks-pdk';
import { errorEmoji, runEmoji } from './emoji';
import { runJs } from './runBlocks/codeRunner';
import { generateImage } from './runBlocks/latexBlock';
import { extractCode } from './runBlocks/index';
import { AttachmentBuilder } from 'discord.js';

export default function codeblockRunner({ client, logger }: PluginContext) {
	client.on('messageReactionAdd', async (messageReaction, user) => {
		logger.verbose('message reaction add');

		const message = messageReaction.message;
		const emoji = messageReaction.emoji.name;
		const channel = message.channel;

		// ignore self reactions
		if (user.id == client.user!.id) {
			return;
		}

		if (!message.guildId) return;

		if (!message.content) return;

		if (emoji == runEmoji) {
			const extracted = extractCode(message.content);
			if (!extracted) return;
			const { lang, code } = extracted;

			if (lang === 'js') {
				const ret = await runJs(
					client,
					message.guildId,
					channel,
					user.id,
					code,
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

			if (lang === 'latex') {
				const res = await generateImage(code);

				if (res.latexError) {
					await message.reply(
						'Latex generation error:\n' +
							'```\n' +
							`${res.latexError}` +
							'\n```'
					);
					return;
				}

				if (res.imageError) {
					await message.reply(
						'svg to image error:\n' +
							'```\n' +
							`${res.imageError}` +
							'\n```'
					);
					return;
				}

				const attachment = new AttachmentBuilder(res.image!, {
					name: 'math.jpg',
				});
				await message.reply({
					content: 'done',
					files: [attachment],
				});
			}
		}
	});
}
