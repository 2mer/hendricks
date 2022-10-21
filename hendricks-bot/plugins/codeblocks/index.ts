import codeblockReactions from './codeblockReactions';
import codeblockRunner from './codeblockRunner';
import { PluginContext } from 'hendricks-pdk';

// plugin id
export const id = 'codeblocks';
// plugin commands
export { default as commands } from './commands';

export let logger = null as null | PluginContext['logger'];

export async function init(ctx: PluginContext) {
	logger = ctx.logger;
	logger.info('Codeblocks loaded!');

	ctx.events.on('plugins:start', () => {
		codeblockReactions(ctx);
		codeblockRunner(ctx);
	});
}
