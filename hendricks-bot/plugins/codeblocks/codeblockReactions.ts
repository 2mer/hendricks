import client from '@hendricks/client';
import { runEmoji } from '@hendricks/constants';
import parseCodeblock from '@hendricks/plugins/codeblocks/util/parseCodeblock';

export default function codeblockReactions() {
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
}
