import path from 'path';
import fs from 'fs';
import IPlugin from './types/IPlugin';
import CommandRegistry from './CommandRegistry';
import events from './events';
import logger, { createLabeledLogger } from './logger';
import { Client } from 'discord.js';
import PluginManager from './plugin-system/PluginManager';
import Awaitable, { IAwaitable } from './util/Awaitable';

const { REPL_ALLOWED = false } = process.env;

type PluginEntry = { instance: IPlugin; loaded: IAwaitable };
const pluginManager = new PluginManager();
const idToPlugin = new Map<string, PluginEntry>();

const disabledPlugins = ['stable-diffusion'];

if (!REPL_ALLOWED) {
	disabledPlugins.push('repl');
}

async function loadPlugins(pluginFolderPath: string): Promise<IPlugin[]> {
	const folders = await fs.promises.readdir(pluginFolderPath);
	const plugins = await Promise.all(
		folders
			.filter((n) => !disabledPlugins.includes(n))
			.map((name) => import(path.join(pluginFolderPath, name)) as any)
	);

	return plugins as any[];
}

export async function getPlugin(pluginId: string) {
	if (idToPlugin.has(pluginId)) {
		const entry = idToPlugin.get(pluginId)!;

		await entry.loaded;

		return entry;
	}

	return undefined;
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
		idToPlugin.set(id, { instance: plugin, loaded: Awaitable() });
	});

	const baseContext = {
		client,
		pluginManager,
		events,
		commandRegistry: CommandRegistry,
	};

	// init all plugins
	await Promise.all(
		[...idToPlugin.values()].map(({ instance: plugin, loaded }) =>
			(plugin.init
				? plugin.init({
						...baseContext,
						logger: createLabeledLogger(plugin.id),
				  })
				: Promise.resolve()
			).then(() => loaded.resolve())
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
