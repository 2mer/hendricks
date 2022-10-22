import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
} from 'discord.js';
import { ICommand, stringOption } from 'hendricks-pdk';
import { runJs } from '../handlers/jsHandler';

const slash = new SlashCommandBuilder()
	.setName('eval')
	.setDescription("evaluate a JS expression in the current channel's context")
	.addStringOption(
		stringOption('code', 'the code to run', true)
	) as SlashCommandBuilder;

async function execute<K extends keyof ClientEvents>(
	client: Client,
	...args: ClientEvents[K]
) {
	const interaction = args[0] as ChatInputCommandInteraction;

	// const client = interaction.client;
	const channel = interaction.channel;
	const user = interaction.user;

	const userId = user.id;

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

	// code
	const code = interaction.options.getString('code');
	if (code == null) {
		await interaction.reply(`cannot execute command, code is null`);
		return;
	}

	// run
	// await interaction.reply(`Running!`);
	await interaction.reply('In progress...');

	try {
		const out = runJs({
			channel,
			client,
			code,
			guildId,
			userId,
		});

		await interaction.editReply('```\n' + `${out}` + '```');
	} catch (err) {
		await interaction.editReply(`error: ${err}`);
		return;
	}
}

export default {
	slash,
	execute,
} as ICommand;
