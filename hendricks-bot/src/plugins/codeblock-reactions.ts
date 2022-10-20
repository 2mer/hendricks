import { client } from '@hendricks';
import { runEmoji } from '@hendricks/constants';
import Plugin from '@hendricks/types/Plugin';
import parseCodeblock from '@hendricks/util/parseCodeblock';

// this should later transform to a fully fledged code block runner plugin
export default {
	id: 'codeblock-reactions',
	start() {
		client.on('messageCreate', async (message) => {
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
		});
	},
} as Plugin;
