import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	ClientEvents,
} from 'discord.js';
import Hendricks from '../Hendricks';

const slash = new SlashCommandBuilder()
	.setName('stats')
	.setDescription('Prints hendricks stat dump');

async function execute<K extends keyof ClientEvents>(
	_: Hendricks,
	...args: ClientEvents[K]
) {
	const interaction = args[0] as ChatInputCommandInteraction;

	import('@discordjs/voice').then(({ generateDependencyReport }) => {
		const depsReport = generateDependencyReport();
		interaction.reply(`\`\`\`\n${depsReport}\`\`\``);
	});
}

export default {
	slash,
	execute,
};
