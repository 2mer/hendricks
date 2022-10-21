import { PluginContext } from 'hendricks-pdk';
import { runEmoji } from './emoji';
import parseCodeblock from './util/parseCodeblock';

export default function codeblockReactions({ client }: PluginContext) {
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
