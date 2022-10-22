import vm from 'vm';
import { logger } from '..';
import { errorEmoji, runEmoji } from '../emoji';
import ICodeblockHandler, {
	ICodeblockRunContext,
} from '../types/ICodeblockHandler';
import { Client, Message, TextBasedChannel } from 'discord.js';

const contexts: Map<string, any> = new Map();

interface BlockOutput {
	sourceMessage: Message | undefined;
	message: Message | undefined;
	outputs: string[];
}

class Session {
	client: Client;
	guildId: string;
	userToChannel = new Map<string, TextBasedChannel>();
	outputs = new Map<string, BlockOutput>();

	constructor(client: Client, guildId: string) {
		this.client = client;
		this.guildId = guildId;
	}

	prepareOutput(key: string, sourceMessage: Message | undefined) {
		this.outputs.set(key, {
			sourceMessage,
			message: undefined,
			outputs: [],
		});
	}

	async addOutput(key: string, data: string) {
		const blockOutput = this.outputs.get(key)!;
		blockOutput.outputs.push(data);

		const content = '```\n' + blockOutput.outputs.join('\n') + '```';

		if (blockOutput.sourceMessage) {
			if (blockOutput.message) await blockOutput.message.edit(content);
			else
				blockOutput.message = await blockOutput.sourceMessage.reply(
					content
				);
		}
	}
}

function getOrCreateContext(client: Client, guildId: string): any {
	let ctx = contexts.get(guildId);
	if (ctx == null) {
		ctx = {
			session: new Session(client, guildId),
			setTimeout,
			debug: logger!.debug,
		};
		contexts.set(guildId, vm.createContext(ctx));
	}
	return ctx;
}

export function runJs({
	channel,
	client,
	code,
	guildId,
	sourceMessage,
	userId,
}: Omit<ICodeblockRunContext, 'emoji'>) {
	// get the context and set the current channel to the current user
	const context = getOrCreateContext(client, guildId);
	context.session.userToChannel.set(userId, channel);

	// bridge between the vm and node
	const key = guildId + channel.id + userId;

	context.session.prepareOutput(key, sourceMessage);

	// run
	const completeCode =
		`
var log = async (data) => {
	// const channel = session.userToChannel.get('${userId}');
	// await channel.send('' + data);
	await session.addOutput('${key}', data);
}\n` + code;
	return vm.runInContext(completeCode, context);
}

export default {
	id: 'jsHandler',

	test: /^js$/,

	async react(message) {
		await message.react(runEmoji);
	},

	async run(ctx: ICodeblockRunContext) {
		const { sourceMessage, emoji } = ctx;
		if (emoji === runEmoji) {
			try {
				runJs(ctx);
			} catch (err: any) {
				sourceMessage?.reply(
					`${errorEmoji} Failed to execute code: \`\`\`${err.toString()}\`\`\``
				);
			}
		}
	},
} as ICodeblockHandler;
