import { Client, Interaction } from "discord.js";
import commands from "../commands/commands";
import { ClientExtras } from "../extra";
import Event from "./event";

export default {
	name: 'interactionCreate',
	once: false,
	async execute(extras: ClientExtras, client: Client, ...args: any[]) {
		const interaction = args[0] as Interaction;

		if (!interaction.isChatInputCommand()) return;

		const command = commands.find(command => command.slash.name == interaction.commandName);

		if (!command) return;

		try {
			await command.execute(extras, client, ...args);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
} as Event;
