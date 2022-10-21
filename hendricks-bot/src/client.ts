import { BaseInteraction, Client, GatewayIntentBits } from 'discord.js';
import CommandRegistry from './CommandRegistry';
import commands from './commands';
import logger from './logger';
import { initPlugins } from './plugins';

const { TOKEN: token } = process.env;

// create the client and its associated variables
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates,
	],
});

// register base commands
CommandRegistry.register(...commands);

// handle slash commands
client.on('interactionCreate', async (...args: any[]) => {
	const interaction = args[0] as BaseInteraction;

	if (interaction.isChatInputCommand()) {
		const command = CommandRegistry.commands.find(
			(command) => command.slash.name == interaction.commandName
		);

		if (!command) return;

		try {
			await command.execute(client, ...args);
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	}
});

client.once('ready', () => {
	logger.info(`Ready! Logged in as ${client.user!.tag}`);

	initPlugins(client);
});

// start the client
client.login(token);

export default client;
