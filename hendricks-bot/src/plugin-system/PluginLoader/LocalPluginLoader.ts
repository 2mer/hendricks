import Plugin from '../Plugin';
import PluginLoader from './PluginLoader';
import path from 'path';
import logger from '@hendricks/logger';

// load plugin instances from a folder,
// the folder should contain plugins.json file with the filenames of all plugin roots
export default class LocalPluginLoader implements PluginLoader {
	pluginsPath: string;

	constructor({ pluginsPath }: { pluginsPath: string }) {
		this.pluginsPath = pluginsPath;
	}

	async loadPlugins(): Promise<Plugin[]> {
		logger.info(`Loading local plugins from ${this.pluginsPath}`);

		const pluginFiles: string[] = (
			await import(path.join(this.pluginsPath, 'plugins.json'))
		).default;

		const plugins = (
			await Promise.all(
				pluginFiles.map(
					(file) => import(path.join(this.pluginsPath, file))
				)
			)
		).map((mod) => mod.default);

		logger.info(`Loaded ${plugins.length} plugins`);

		return plugins;
	}
}
