import Hendricks from 'src/Hendricks';
import Awaitable, { IAwaitable } from 'src/util/Awaitable';
import Plugin from './Plugin';

type PluginEntry = { instance: Plugin; loaded: IAwaitable };

export default class PluginManager {
	plugins: Plugin[] = [];
	idToPlugin = new Map<string, PluginEntry>();

	register(...plugins: Plugin[]) {
		this.plugins = this.plugins.concat(plugins);

		plugins.forEach((plugin) => {
			const { id } = plugin;

			if (this.idToPlugin.has(id)) {
				throw new Error(`Duplicate plugin with id '${id}'`);
			}

			this.idToPlugin.set(id, { instance: plugin, loaded: Awaitable() });
		});
	}

	async init(hendricks: Hendricks) {
		await Promise.all(
			[...this.idToPlugin.values()].map(({ instance: plugin, loaded }) =>
				(plugin.init
					? plugin.init(hendricks)
					: Promise.resolve()
				).then(() => loaded.resolve())
			)
		);

		hendricks.events.emit('plugins:init');
		const commands = this.plugins
			.map((plugin) => plugin.commands ?? [])
			.reduce((acc, curr) => acc.concat(curr), []);

		// register plugin commands to the command registry
		hendricks.commandRegistry.register(...commands);

		hendricks.events.emit('register:commands');
	}

	async getPlugin(pluginId: string) {
		if (this.idToPlugin.has(pluginId)) {
			const entry = this.idToPlugin.get(pluginId)!;

			await entry.loaded;

			return entry;
		}

		return undefined;
	}
}
