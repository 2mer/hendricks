import {
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
	SlashCommandBuilder,
} from 'discord.js';
import tasks from '../tasks';
import ICommand from '../../../types/ICommand';
import axios from 'axios';

const slash = new SlashCommandBuilder()
	.setName('queued')
	.setDescription('Displays all the queued prompts and their authors');

async function execute<K extends keyof ClientEvents>(
	client: Client,
	...args: ClientEvents[K]
) {
	// extract interaction
	const interaction = args[0] as ChatInputCommandInteraction;
	const user = interaction.user;
	const channel = interaction.channel;
	const guildId = interaction.guildId;

	// load env
	const serverIp = process.env['SERVER_IP'];
	const serverPort = process.env['SERVER_PORT'];
	const addr = `${serverIp}:${serverPort}`;

	// check that there is a text channel
	if (!channel) {
		await interaction.reply(
			`Interaction.channel is null. This shouldn't have happened.`
		);
		return;
	}

	if (!guildId) {
		await interaction.reply(
			`Interaction.guildId is null. This shouldn't have happened.`
		);
		return;
	}

	// send the request to the server
	const { data: res } = await axios.get(`http://${addr}/queued/`);
	const queued = res as number[];

	// get the tasks and create the message
	const message =
		queued.length == 0
			? 'no tasks queued!'
			: queued
					.map((id: number) => tasks.get(guildId, `${id}`))
					.map((task) =>
						task
							? `${task.author} -> ${task.task}`
							: `task from a different guild`
					)
					.join('\n');

	await interaction.reply(`<@${user.id}>` + '```' + message + '```');
	// await channel.send();
}

export default {
	slash,
	execute,
} as ICommand;
