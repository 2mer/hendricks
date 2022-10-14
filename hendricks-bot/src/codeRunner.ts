import { ChatInputCommandInteraction, Client, Message, PartialMessage, TextBasedChannel } from "discord.js";
import vm from "vm";

var contexts: Map<string, any> = new Map();

class Session {
	client: Client;
	guildId: string;
	userToChannel = new Map<string, TextBasedChannel>();
	outputs = new Map<string, [Message, string[]]>();

	constructor(client: Client, guildId: string) {
		this.client = client;
		this.guildId = guildId;
	}

	prepareOutput(key: string, message: Message) {
		this.outputs.set(key, [message, []])
	}

	async addOutput(key: string, data: string) {
		const [message, lines] = this.outputs.get(key)!;
		lines.push(data);
		if (message != null) {
			await message.edit('```\n' + lines.join('\n') + '```');
		}
	}
}

function getOrCreateContext(client: Client, guildId: string): any {
	let ctx = contexts.get(guildId);
	if (ctx == null) {
		ctx = {
			session: new Session(client, guildId),
			debug: console.log
		};
		contexts.set(guildId, vm.createContext(ctx));
	}
	return ctx;
}

type OptionalMessage = Message | PartialMessage | undefined;

export function extractCode(content: string): { lang: string, code: string } | undefined {
	// split into lines
	const lines = content.split(/\n\r?/);
	if (lines.length < 2)
		return undefined;


	// content must start and end with '```'
	const firstLine = lines[0];
	const lastLine = lines[lines.length - 1];
	if (!firstLine.startsWith('```') || lastLine != '```')
		return undefined;

	// extract and return
	return {
		lang: firstLine.substring(3),
		code: lines.slice(1, lines.length - 1).join('\n'),
	};
}

export function runFromReaction(
	client: Client,
	guildId: string,
	channel: TextBasedChannel,
	messageId: string,
	userId: string,
	content: string,
	message: OptionalMessage): any {
	// extract the code and the language
	const extracted = extractCode(content);
	if (extracted == null)
		return;
	const { lang, code } = extracted;

	// run and pipe the output to a reply
	if (lang == 'js') {
		return run(client, guildId, channel, userId, code, message);
	}
}

export async function run(
	client: Client,
	guildId: string,
	channel: TextBasedChannel,
	userId: string,
	code: String,
	sourceMessage: OptionalMessage) {
	// get the context and set the current channel to the current user
	const context = getOrCreateContext(client, guildId);
	context.session.userToChannel.set(userId, channel);

	// bridge between the vm and node
	const key = guildId + channel.id + userId;
	// const outMessage = await channel.send('```\n```');

	const empty = '```\n```';
	// const outMessage = sourceMessage == null ? await channel.send(empty) : await sourceMessage.reply(empty);
	const outMessage = sourceMessage == null ? null : await sourceMessage.reply(empty);
	context.session.prepareOutput(key, outMessage);

	// run
	const completeCode = `
		var log = async (data) => {
			// const channel = session.userToChannel.get('${userId}');
			// await channel.send('' + data);
			await session.addOutput('${key}', data);
		}\n`+
		code;
	try {
		const out = vm.runInContext(completeCode, context);
		return {
			out,
			error: undefined
		};
	} catch (e) {
		return {
			out: undefined,
			error: e,
		};
	}
}
