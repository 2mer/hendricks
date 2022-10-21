import { IPluginProvider, PluginManager } from '@sgty/plugin-system';
import path from 'path';
import fs from 'fs';
import IPlugin from './types/IPlugin';
import CommandRegistry from './CommandRegistry';
import events from './events';
import logger, { createLabeledLogger } from './logger';
import { Client } from 'discord.js';

const pluginManager = new PluginManager<IPlugin>();
const idToPlugin = new Map();

class LocalPluginProvider implements IPluginProvider<IPlugin> {
	pluginFolderPath: string;

	constructor(pluginFolderPath: string) {
		this.pluginFolderPath = pluginFolderPath;
	}

	async providePlugins(): Promise<IPlugin[]> {
		const folders = await fs.promises.readdir(this.pluginFolderPath);

		return folders.map(
			(name) => import(path.join(this.pluginFolderPath, name)) as any
		);
	}
}

export async function initPlugins(client: Client) {
	// load plugin instances
	await pluginManager.registerPlugins(
		new LocalPluginProvider(path.join(__dirname, '..', 'plugins'))
	);

	pluginManager.plugins.forEach((plugin) => {
		const { id } = plugin;

		if (idToPlugin.has(id)) {
			throw new Error(`Duplicate plugin with id '${id}'`);
		}

		logger.info(`Registered plugin ${id}`);
		idToPlugin.set(id, plugin);
	});

	const baseContext = {
		client,
		pluginManager,
		events,
		commandRegistry: CommandRegistry,
	};

	// init all plugins
	await Promise.all(
		pluginManager.plugins.map((plugin) =>
			plugin.init
				? plugin.init({
						...baseContext,
						logger: createLabeledLogger(plugin.id),
				  })
				: Promise.resolve()
		)
	);

	events.emit('plugins:init');

	// get all plugin commands
	const commands = pluginManager.plugins
		.map((plugin) => plugin.commands ?? [])
		.reduce((acc, curr) => acc.concat(curr), []);

	// register plugin commands to the command registry
	CommandRegistry.register(...commands);

	events.emit('register:commands');
}

export default pluginManager;
