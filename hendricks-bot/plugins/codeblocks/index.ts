import codeblockReactions from './codeblockReactions';
import codeblockRunner from './codeblockRunner';
import { PluginContext } from 'hendricks-pdk';

// plugin id
export const id = 'codeblocks';
// plugin commands
export { default as commands } from './commands';

export async function init(ctx: PluginContext) {
	ctx.events.on('plugins:start', () => {
		codeblockReactions(ctx);
		codeblockRunner(ctx);
	});
}
