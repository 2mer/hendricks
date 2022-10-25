import { PluginContext } from 'hendricks-pdk';
// plugin id
export const id = 'webserver';
// plugin commands
// export { default as commands } from './commands';

export let logger = null as null | PluginContext['logger'];

export async function init(ctx: PluginContext) {
	logger = ctx.logger;
}
