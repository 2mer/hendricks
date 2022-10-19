import Plugin from '../Plugin';

export default interface PluginLoader {
	loadPlugins(): Promise<Plugin[]>;
}
