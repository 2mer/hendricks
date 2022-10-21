import { IPlugin } from 'src/types';

export default class PluginManager {
	plugins: IPlugin[] = [];

	register(...plugins: IPlugin[]) {
		this.plugins.concat(plugins);
	}
}
