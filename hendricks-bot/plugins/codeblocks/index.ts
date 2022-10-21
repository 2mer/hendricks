import codeblockReactions from './codeblockReactions';
import codeblockRunner from './codeblockRunner';
import { PluginContext } from 'hendricks-pdk';

// plugin id
export const id = 'codeblocks';
// plugin commands
export { default as commands } from './commands';

export async function init({ events }: PluginContext) {
	events.on('plugins:start', () => {
		codeblockReactions();
		codeblockRunner();
	});
}
