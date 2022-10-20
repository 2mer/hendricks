import path from 'path';
import LocalPluginLoader from './plugin-system/PluginLoader/LocalPluginLoader';
import PluginManager from './plugin-system/PluginManager';

export default async function initPlugins() {
	// start the plugins
	await PluginManager.start(
		new LocalPluginLoader({
			pluginsPath: path.join(__dirname, 'plugins'),
		})
	);
}
