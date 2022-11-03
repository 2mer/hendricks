import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	ClientEvents,
} from 'discord.js';
import Hendricks from '../Hendricks';

const slash = new SlashCommandBuilder()
	.setName('exit')
	.setDescription('exists Hendricks');

async function execute<K extends keyof ClientEvents>(
	hendricks: Hendricks,
	...args: ClientEvents[K]
) {
	const interaction = args[0] as ChatInputCommandInteraction;
	await interaction.reply('bye bye');
	hendricks.destroy();
}

export default {
	slash,
	execute,
};
