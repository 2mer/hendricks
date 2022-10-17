import {
	AudioPlayerStatus,
	createAudioPlayer,
	createAudioResource,
	getVoiceConnection,
	joinVoiceChannel,
} from '@discordjs/voice';
import {
	ChannelType,
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
	Collection,
	GuildMember,
	SlashCommandBuilder,
} from 'discord.js';
import logger from '../logger';
import Command from '../types/Command';

const slash = new SlashCommandBuilder()
	.setName('play')
	.setDescription('Plays a song the specified file');

async function execute<K extends keyof ClientEvents>(
	client: Client,
	...args: ClientEvents[K]
) {
	const audioFilePath = process.env['AUDIO_FILE'] as string;

	const resource = createAudioResource(audioFilePath);

	const interaction = args[0] as ChatInputCommandInteraction;

	const channel = interaction.channel!;
	const user = interaction.user;

	// extract all voice channels
	const voiceChannels = interaction.guild?.channels.cache.filter(
		(c) => c.type == ChannelType.GuildVoice
	);

	if (!voiceChannels) {
		logger.error(
			`<@${user.id}> Could not extract voice channels. This is a bug.`
		);
		return;
	}

	// find the voice channel associated with the user who initiated the command
	const voiceChannel = voiceChannels.find((vc) => {
		const members = vc.members;

		if (members instanceof Collection) {
			const m = members as Collection<any, GuildMember>;
			for (const id of m.keys()) if (id == user.id) return true;
		}

		return false;
	});

	if (!voiceChannel) {
		await channel.send(
			`<@${user.id}> You are not currently in a voice channel.`
		);
		return;
	}

	// get a connection to the voice channel
	const connection =
		getVoiceConnection(voiceChannel.id, voiceChannel.guild.id) ||
		joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		});

	const player = createAudioPlayer();

	player.on('error', (error) => {
		console.error(
			`Error: ${error.message} with resource ${
				(error as any).resource.metadata.title
			}`
		);
	});

	player.play(resource);

	const subscription = connection.subscribe(player);

	player.on('stateChange', async (o, n) => {
		if (n.status === AudioPlayerStatus.Idle) {
			if (subscription) {
				subscription.unsubscribe();
			}

			player.stop();
			connection.disconnect();
			connection.destroy();
		}
	});

	await interaction.reply({ content: 'claim your krosty', ephemeral: true });
}

export default {
	slash,
	execute,
} as Command;
