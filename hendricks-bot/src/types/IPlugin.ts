import ICommand from './ICommand';
import { PluginManager } from '@sgty/plugin-system';
import { Client } from 'discord.js';
import CommandRegistry from 'src/CommandRegistry';

export default interface IPlugin {
	id: string;
	init?(ctx: PluginContext): Promise<void>;
	commands?: ICommand[];
}

export type PluginContext = {
	client: Client;
	pluginManager: PluginManager<IPlugin>;
	commandRegistry: CommandRegistry;
};
