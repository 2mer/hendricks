import { SlashCommandBuilder, ChatInputCommandInteraction, Client, ClientEvents, SlashCommandStringOption, Channel, TextBasedChannel } from "discord.js";
import { ClientExtras } from "../extra";

const slash = new SlashCommandBuilder()
	.setName('exit')
	.setDescription('exists Hendricks');

async function execute<K extends keyof ClientEvents>(clientExtras: ClientExtras, client: Client, ...args: ClientEvents[K]) {
	const interaction = args[0] as ChatInputCommandInteraction;
	await interaction.reply('bye bye');
	client.destroy();
}

export default {
	slash,
	execute,
};
