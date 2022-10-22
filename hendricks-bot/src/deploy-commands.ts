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

// add guild only commands
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
	.then((data) =>
		logger.info(
			`Successfully registered ${(data as any[]).length} guild commands.`
		)
	)
	.catch(console.error);

export async function deployCommands(commands: ICommand[]) {
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

events.on('register:commands', async () => {
	await deployCommands(CommandRegistry.commands);

	client.destroy();
});
