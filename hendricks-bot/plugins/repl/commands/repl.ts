import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
	BaseGuildTextChannel,
} from 'discord.js';
import { ICommand } from 'hendricks-pdk';
import { instances } from '..';
import handlers from '../handlers';
import MessageQueue from '../util/MessageQueue';

const slash = new SlashCommandBuilder()
	.setName('repl')
	.setDescription('creates a repl thread')
	.addStringOption((option) =>
		option
			.setName('type')
			.setDescription('The repl type')
			.setRequired(true)
			.addChoices(
				...handlers.map((h) => ({ name: h.name || h.id, value: h.id }))
			)
	) as SlashCommandBuilder;

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

	const replType = interaction.options.getString('type');

	const handler = handlers.find((h) => h.id === replType);

	if (!handler)
		throw new Error(
			'This should not happen, are slash commands not in sync running code?'
		);

	async function createRepl() {
		const thread = await (
			interaction.channel as BaseGuildTextChannel
		).threads.create({
			name: `REPL (${handler?.name || handler?.id})`,
			autoArchiveDuration: 60,
			reason: 'Spawned from repl command',
		});

		await thread.join();

		const proc = handler!.createProcess();
		const instance = {
			thread,
			process: proc,
			messageQueue: new MessageQueue({ thread }),
		};
		instances.push(instance);

		async function handleData(data: any) {
			let strData: string = data.toString();

			strData = strData
				.split('\n')
				.filter((line) => !handler!.trimLine.test(line))
				.join('\n');

			const maxSize = 500;
			if (strData.length > maxSize) {
				strData = strData.substring(0, maxSize - 3) + '...';
			}

			if (strData) {
				instance.messageQueue.push(strData);
			}
		}

		proc.stdout.on('data', handleData);
		proc.stderr.on('data', handleData);

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
