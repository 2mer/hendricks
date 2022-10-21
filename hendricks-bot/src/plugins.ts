import path from 'path';
import fs from 'fs';
import IPlugin from './types/IPlugin';
import CommandRegistry from './CommandRegistry';
import events from './events';
import logger, { createLabeledLogger } from './logger';
import { Client } from 'discord.js';
import PluginManager from './plugin-system/PluginManager';

const pluginManager = new PluginManager();
const idToPlugin = new Map();

async function loadPlugins(pluginFolderPath: string): Promise<IPlugin[]> {
	const folders = await fs.promises.readdir(pluginFolderPath);
	const plugins = await Promise.all(
		folders
			.filter((n) => n !== 'stable-diffusion')
			.map((name) => import(path.join(pluginFolderPath, name)) as any)
	);

	return plugins as any[];
}

export async function initPlugins(client: Client) {
	// load plugin instances
	const plugins = await loadPlugins(path.join(__dirname, '..', 'plugins'));

	pluginManager.register(...plugins);

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

	console.log(pluginManager.plugins);
}

export default pluginManager;
