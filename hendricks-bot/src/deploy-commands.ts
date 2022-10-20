import { config } from 'dotenv';
config();

import { REST, Routes } from 'discord.js';
import logger from './logger';
import Command from './types/Command';
import client from './client';
import PluginManager from './plugin-system/PluginManager';
import CommandRegistry from './CommandRegistry';

const token = process.env['TOKEN'] as string;
const guildId = process.env['GUILD_ID'] as string;
const clientId = process.env['CLIENT_ID'] as string;

const rest = new REST({ version: '10' }).setToken(token);

// add guild only commands
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
	.then((data) =>
		logger.info(
			`Successfully registered ${(data as any[]).length} guild commands.`
		)
	)
	.catch(console.error);

export async function deployCommands(commands: Command[]) {
	// add global commands
	const applicationCommands = commands.map((command) =>
		command.slash.toJSON()
	);
	rest.put(Routes.applicationCommands(clientId), {
		body: applicationCommands,
	})
		.then((data) =>
			logger.info(
				`Successfully registered ${
					(data as any[]).length
				} application commands.`
			)
		)
		.catch(console.error);
}

client.once('ready', async () => {
	await PluginManager.loaded();
	CommandRegistry.register(...PluginManager.getCommands());

	await deployCommands(CommandRegistry.commands);

	setTimeout(() => {
		client.destroy();
	}, 1000);
});
