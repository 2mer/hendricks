import Plugin from '../../types/Plugin';
import PluginLoader from '../../types/PluginLoader';

// load plugins statically from js context
export default class LocalPluginLoader implements PluginLoader {
	plugins: Plugin[];

	constructor(...plugins: Plugin[]) {
		this.plugins = plugins;
	}

	async loadPlugins(): Promise<Plugin[]> {
		return this.plugins;
	}
}
