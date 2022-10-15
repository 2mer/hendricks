import { Client, Interaction } from "discord.js";
import reimagine from "../buttonCommands/reimagine";
import commands from "../commands/commands";
import { ClientExtras } from "../extra";
import Event from "./event";

export default {
	name: 'interactionCreate',
	once: false,
	async execute(extras: ClientExtras, client: Client, ...args: any[]) {
		const interaction = args[0] as Interaction;

		if (interaction.isChatInputCommand()) {
			const command = commands.find(command => command.slash.name == interaction.commandName);

			if (!command) return;

			try {
				await command.execute(extras, client, ...args);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}

		if (interaction.isButton()) {
			const message = interaction.message;
			const label = interaction.component.label;
			const buttonId = interaction.customId;

			if (!client.user) {
				await interaction.reply(`client.user is undefined. This is a bug.`);
				return;
			}

			if (message.client.user.id != client.user?.id) {
				return;
			}

			if (!label) {
				return;
			}

			if (label == 'Delete') {
				await interaction.message.delete();
				return;
			}

			if (label.match(/V\d/)) {
				await reimagine(interaction, label, buttonId);
				return;
			}

			await interaction.reply(`${message.content}: ${label}`);
		}
	}
} as Event;
