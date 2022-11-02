import { BaseInteraction, Client, REST, Routes } from 'discord.js';
import { Logger } from 'winston';
import createClient from './Client';
import createEvents, { Events } from './Events';
import createLabeledLogger from './Logger';
import CommandRegistry from './registry/CommandRegistry';
import Plugin from './registry/Plugin';
import PluginManager from './registry/PluginManager';

export type IHendricksOptions = {
	plugins?: Plugin[];
	token: string;
	guildId: string;
	clientId: string;
};

export default class Hendricks {
	options: IHendricksOptions;

	client: Client;
	pluginManager: PluginManager;
	commandRegistry: CommandRegistry;
	events: Events;
	logger: Logger;

	constructor(options: IHendricksOptions) {
		this.options = options;

		this.client = createClient({ token: this.options.token });
		this.pluginManager = new PluginManager();
		this.commandRegistry = new CommandRegistry();
		this.events = createEvents();
		this.logger = createLabeledLogger('hendricks');

		this.pluginManager.register(...(this.options.plugins ?? []));

		// handle slash commands
		this.client.on('interactionCreate', async (...args: any[]) => {
			const interaction = args[0] as BaseInteraction;

			if (interaction.isChatInputCommand()) {
				const command = this.commandRegistry.commands.find(
					(command) => {
						return command.slash.name === interaction.commandName;
					}
				);

				if (!command) return;

				try {
					await command.execute(this, ...args);
				} catch (error) {
					console.error(error);
					await interaction.reply({
						content:
							'There was an error while executing this command!',
						ephemeral: true,
					});
				}
			}
		});

		this.client.once('ready', () => {
			this.logger.info(`Ready! Logged in as ${this.client.user!.tag}`);

			this.pluginManager.init(this);
		});
	}

	deployCommands({ target }: { target: 'GUILD' | 'GLOBAL' }) {
		const rest = new REST({ version: '10' }).setToken(this.options.token);

		const applicationCommands = this.commandRegistry.commands.map(
			(command) => command.slash.toJSON()
		);

		const route =
			target === 'GUILD'
				? Routes.applicationGuildCommands(
						this.options.clientId,
						this.options.guildId
				  )
				: Routes.applicationCommands(this.options.clientId);

		rest.put(route, {
			body: applicationCommands,
		})
			.then((data) =>
				this.logger.info(
					`Successfully registered ${(data as any[]).length} ${
						target === 'GUILD' ? 'guild' : 'application'
					} commands.`
				)
			)
			.catch(console.error);
	}

	start() {
		// after plugins have loaded, start plugins
		this.events.on('plugins:init', () => {
			this.logger.info(
				`🧩 ${this.pluginManager.plugins.length} Plugins initialized`
			);

			this.events.emit('plugins:start');
		});

		this.events.on('register:commands', () => {
			this.logger.info(
				`💬 ${this.commandRegistry.commands.length} Commands registered`
			);
		});
	}

	destroy() {
		this.client.destroy();
	}
}
