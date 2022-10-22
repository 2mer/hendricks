import { config } from 'dotenv';
config();

import { REST, Routes } from 'discord.js';
import logger from './logger';
import ICommand from './types/ICommand';
import client from './client';
import CommandRegistry from './CommandRegistry';
import events from './events';

const token = process.env['TOKEN'] as string;
const guildId = process.env['GUILD_ID'] as string;
const clientId = process.env['CLIENT_ID'] as string;

const rest = new REST({ version: '10' }).setToken(token);

const GUILD_COMMANDS_MODE = true;

export async function deployCommands(commands: ICommand[], guildMode = false) {
	// add global commands
	const applicationCommands = commands.map((command) =>
		command.slash.toJSON()
	);

	const route = guildMode
		? Routes.applicationGuildCommands(clientId, guildId)
		: Routes.applicationCommands(clientId);

	rest.put(route, {
		body: applicationCommands,
	})
		.then((data) =>
			logger.info(
				`Successfully registered ${(data as any[]).length} ${
					guildMode ? 'guild' : 'application'
				} commands.`
			)
		)
		.catch(console.error);
}

events.on('register:commands', async () => {
	await deployCommands(CommandRegistry.commands, GUILD_COMMANDS_MODE);

	client.destroy();
});
