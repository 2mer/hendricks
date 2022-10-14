import { SlashCommandBuilder, ChatInputCommandInteraction, Client, ClientEvents, SlashCommandStringOption, Channel, TextBasedChannel } from "discord.js";
import { run } from "../codeRunner";
import { ClientExtras } from "../extra";
import { stringOption } from "./utils";

const slash = new SlashCommandBuilder()
	.setName('eval')
	.setDescription('evaluate a JS expression in the current channel\'s context')
	.addStringOption(stringOption('code', 'the code to run', true));

async function execute<K extends keyof ClientEvents>(clientExtras: ClientExtras, client: Client, ...args: ClientEvents[K]) {
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

	const res = await run(client, guildId, channel, userId, code, undefined);

	if (res.error) {
		await interaction.editReply(`error: ${res.error}`);
		return;
	}

	await interaction.editReply(`${res.out}`);
}

export default {
	slash,
	execute,
};
