import codeblockReactions from './codeblockReactions';
import codeblockRunner from './codeblockRunner';
import { PluginContext } from 'hendricks-pdk';
import ICodeblockHandler from './types/ICodeblockHandler';
import handlers from './handlers';

// plugin id
export const id = 'codeblocks';
// plugin commands
export { default as commands } from './commands';

export let logger = null as null | PluginContext['logger'];

export const codeblockHandlers: ICodeblockHandler[] = [];

// export these functions so other plugins may register handlers dynamically via PluginManager#getPlugin
export async function registerCodeblockHandler(handler: ICodeblockHandler) {
	if (handler.init) {
		await handler.init();
	}

	codeblockHandlers.push(handler);
}

export function removeCodeblockHandler(handler: ICodeblockHandler) {
	const index = codeblockHandlers.indexOf(handler);
	if (index !== -1) {
		codeblockHandlers.splice(index, 1);
	}
}

export async function init(ctx: PluginContext) {
	logger = ctx.logger;

	handlers.forEach((handler) => {
		registerCodeblockHandler(handler);
	});

	logger.info(`🟦 ${handlers.length} Codeblock handlers loaded`);

	ctx.events.on('plugins:start', () => {
		codeblockReactions(ctx);
		codeblockRunner(ctx);
	});
}
