import { ChannelType, ChatInputCommandInteraction, Client, Collection, GuildMember, Interaction, ThreadMemberManager } from 'discord.js';
import { GatewayIntentBits, ClientUser } from 'discord.js';
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, generateDependencyReport, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior } from '@discordjs/voice';

console.log(generateDependencyReport());

// load env
require('dotenv').config()
const token = process.env['TOKEN'];
const audioFilePath = process.env['AUDIO_FILE'] as string;

// create the client and its associated variables
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// client events
client.once('ready', c => {
	console.log('client is ready');
});

client.once('interactionCreate', async (...args) => {
	if (!args[0].isChatInputCommand()) return;
	const interaction = args[0] as ChatInputCommandInteraction;

	if (interaction.commandName == 'play') {
		try {
			await playAudio(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

});

// command code - enter a voice channel and play an audio file
async function playAudio(interaction: ChatInputCommandInteraction) {
	await interaction.reply({ content: 'ok!', ephemeral: true });

	const channel = interaction.channel!;
	const user = interaction.user;

	// extract all voice channels
	const voiceChannels = interaction.guild?.channels.cache.filter(c => c.type == ChannelType.GuildVoice);
	if (!voiceChannels) {
		await channel.send(`<@${user.id}> Could not extract voice channels. This is a bug.`);
		return;
	}

	// find the voice channel associated with the user who initiated the command
	const voiceChannel = voiceChannels.find(vc => {
		const members = vc.members;

		if (members instanceof Collection) {
			const m = members as Collection<any, GuildMember>;
			for (const id of m.keys())
				if (id == user.id)
					return true;
		}

		if (members instanceof ThreadMemberManager) {
			// const m = members as ThreadMemberManager;
			console.log('ThreadMemberManager');
		}

		return false;
	});

	if (!voiceChannel) {
		await channel.send(`<@${user.id}> You are not currently in a voice channel.`);
		return;
	}

	await channel.send(`<@${user.id}> ok`);

	// get a connection to the voice channel
	const connection = getVoiceConnection(
		voiceChannel.id,
		voiceChannel.guild.id,
	) || joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: voiceChannel.guild.id,
		adapterCreator: voiceChannel.guild.voiceAdapterCreator,
	});

	const resource = createAudioResource(audioFilePath);

	const player = createAudioPlayer({
		behaviors: {
			noSubscriber: NoSubscriberBehavior.Play,
		}
	});

	player.on(AudioPlayerStatus.Playing, () => {
		console.log('The audio player has started playing!');
	});

	player.on('error', async error => {
		console.error(`Error: ${error.message} with resource ${(error as any).resource.metadata.title}`);
		await channel.send(`Error: ${error.message} with resource ${(error as any).resource.metadata.title}`);
		// player.play(getNextResource());
	});

	player.on('stateChange', async (oldState, newState) => {
		await channel.send(`Connection transitioned from ${oldState.status} to ${newState.status}`);
	});

	player.play(resource);

	const subscription = connection.subscribe(player);

	// subscription could be undefined if the connection is destroyed!
	if (subscription) {
		// Unsubscribe after 5 seconds (stop playing audio on the voice connection)
		setTimeout(async () => {
			await channel.send(`bye bye`);
			subscription.unsubscribe();
			console.log('unsubscribed');
			player.stop();
			connection.disconnect();
			connection.destroy();
		}, 5000);
	} else {
		await channel.send(`<@${user.id}> could not subscribe to voice channel.`);
	}

	await channel.send(`<@${user.id}> ok`);
}

// start the client
client.login(token);
