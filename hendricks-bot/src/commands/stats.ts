import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
} from 'discord.js';

const slash = new SlashCommandBuilder()
	.setName('stats')
	.setDescription('Prints hendricks stat dump');

async function execute<K extends keyof ClientEvents>(
	_: Client,
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
