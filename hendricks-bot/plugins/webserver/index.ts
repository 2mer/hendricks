import { PluginContext } from 'hendricks-pdk';
import { startServer } from './server';
// plugin id
export const id = 'webserver';
// plugin commands
// export { default as commands } from './commands';

export let logger = null as null | PluginContext['logger'];

export async function init(ctx: PluginContext) {
	logger = ctx.logger;

	ctx.events.on('plugins:start', () => {
		startServer();
		logger!.info('🌎 1 Web server started');
	});
}
