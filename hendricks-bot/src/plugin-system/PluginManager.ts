import logger from '@hendricks/logger';
import Plugin from '../types/Plugin';
import PluginLoader from '../types/PluginLoader';

let loadedResolve: any;
const loadedPromise = new Promise((resolve) => {
	loadedResolve = resolve;
});

export default class PluginManager {
	private static plugins = {} as { [key: string]: Plugin };

	static async loaded() {
		return loadedPromise;
	}

	static register(...plugins: Plugin[]) {
		plugins.forEach((plugin) => {
			const { id } = plugin;

			if (this.plugins[id])
				throw new Error(`Plugin with id '${id}' is already registered`);

			this.plugins[id] = plugin;
		});

		logger.info(`Registered ${plugins.length} plugins`);
	}

	static async start(...pluginLoaders: PluginLoader[]) {
		// first we register all plugins
		const loaderPlugins = await Promise.all(
			pluginLoaders.map((loader) => loader.loadPlugins())
		);

		// flatten
		const plugins = loaderPlugins.reduce((acc, curr) => {
			return acc.concat(curr);
		}, []);

		// register all the plugins, so you can get them via PluginManager#getPlugin
		this.register(...plugins);

		// wait for all plugins to init
		await Promise.all(
			plugins.map((plugin) =>
				// init code is optional
				plugin.init ? plugin.init() : Promise.resolve()
			)
		);

		// start all of the plugins
		plugins.forEach((plugin) => {
			plugin.start?.();
		});

		loadedResolve?.();
	}

	static getPlugin(id: string) {
		return this.plugins[id];
	}

	static getCommands() {
		return Object.values(this.plugins)
			.map((plugin) => plugin.commands || [])
			.reduce((acc, curr) => acc.concat(curr), []);
	}
}
