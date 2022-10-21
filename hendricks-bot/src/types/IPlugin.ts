import ICommand from './ICommand';
import { Client } from 'discord.js';
import CommandRegistry from '../CommandRegistry';
import { Events } from '../events';
import { Logger } from 'winston';
import PluginManager from 'src/plugin-system/PluginManager';

export default interface IPlugin {
	id: string;
	init?(ctx: PluginContext): Promise<void>;
	commands?: ICommand[];
}

export type PluginContext = {
	client: Client;
	pluginManager: PluginManager;
	commandRegistry: CommandRegistry;
	events: Events;
	logger: Logger;
};
