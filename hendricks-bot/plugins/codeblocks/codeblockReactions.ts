import { PluginContext } from 'hendricks-pdk';
import { runEmoji } from './emoji';
import parseCodeblock from './util/parseCodeblock';

const supportedLanguages = ['js', 'latex'];

export default function codeblockReactions({ client }: PluginContext) {
	client.on('messageCreate', async (message) => {
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
		if (user.id == client.user.id) return;

		// extract the code from the message
		const extracted = parseCodeblock(message.content);
		if (!extracted) {
			return;
		}

		if (supportedLanguages.includes(extracted.lang))
			await message.react(runEmoji);
	});
}
