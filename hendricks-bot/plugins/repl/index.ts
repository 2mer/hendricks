import { PluginContext } from 'hendricks-pdk';
import IRepl from './types/IRepl';
// plugin id
export const id = 'repl';
// plugin commands
export { default as commands } from './commands';

export let logger = null as null | PluginContext['logger'];

export const instances: IRepl[] = [];

export async function init(ctx: PluginContext) {
	logger = ctx.logger;

	ctx.client.on('messageCreate', async (message) => {
		const user = message.author;
		const guildId = message.guildId;
		const channel = message.channel;

		if (!guildId) {
			message.reply('guildId is null. Aborting.');
			return;
		}

		if (!ctx.client.user) {
			message.reply('client.user is null. Aborting.');
			return;
		}

		// ignore self messages
		if (user.id == ctx.client.user.id) return;

		const found = instances.find(
			(instance) => instance.thread.id === channel.id
		);

		if (message.content === 'delete') {
			await found?.thread.delete();
			return;
		}

		if (found) {
			found.messageQueue.clear();
			const actualMessage = message.content.replace(
				/^```\w*\s*(.*?)\s*```$/s,
				'$1'
			);
			found.process.stdin.write(actualMessage + '\n');
		}
	});
}
