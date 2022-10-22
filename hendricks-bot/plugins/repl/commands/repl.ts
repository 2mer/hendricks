import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
	BaseGuildTextChannel,
} from 'discord.js';
import { ICommand } from 'hendricks-pdk';
import { instances } from '..';
import { spawn } from 'node:child_process';

const slash = new SlashCommandBuilder()
	.setName('repl')
	.setDescription('creates a ts-node repl thread') as SlashCommandBuilder;

async function execute<K extends keyof ClientEvents>(
	client: Client,
	...args: ClientEvents[K]
) {
	const interaction = args[0] as ChatInputCommandInteraction;

	// const client = interaction.client;
	const channel = interaction.channel;

	// channel
	if (channel == null) {
		await interaction.reply(`cannot execute command, channel is null`);
		return;
	}

	// guild
	const guildId = interaction.guildId;
	if (guildId == null) {
		await interaction.reply(`cannot execute command, guildId is null`);
		return;
	}

	async function createRepl() {
		const thread = await (
			interaction.channel as BaseGuildTextChannel
		).threads.create({
			name: `repl ${interaction.id}`,
			autoArchiveDuration: 60,
			reason: 'Spawned from repl command',
		});

		await thread.join();
		const proc = spawn('node', ['-i'], { shell: true });
		const instance = { thread, process: proc };
		instances.push(instance);

		proc.stdout.on('data', (data) => {
			let strData: string = data.toString();

			strData = strData
				.split('\n')
				.filter((line) => line.replace(/\s/g, '') !== '>')
				.join('\n');

			const maxSize = 500;
			if (strData.length > maxSize) {
				strData = strData.substring(0, maxSize - 3) + '...';
			}

			if (strData) {
				thread.send(`\`\`\`${strData}\`\`\``);
			}
		});

		proc.stderr.on('data', (data) => {
			thread.send(`❌ \`\`\`${data}\`\`\``);
		});

		proc.on('close', (code) => {
			thread.send(`child process exited with code ${code}`);
			thread.setLocked(true);

			const index = instances.indexOf(instance);
			if (index !== -1) {
				instances.splice(index, 1);
			}
		});
	}

	await createRepl();
	await interaction.reply('Repl instance created 👇');
}

export default {
	slash,
	execute,
} as ICommand;
