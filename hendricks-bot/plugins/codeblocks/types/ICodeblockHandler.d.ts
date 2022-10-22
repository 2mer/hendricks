import { Client, Message, PartialMessage, TextBasedChannel } from 'discord.js';
type OptionalMessage = Message | PartialMessage | undefined;

export type ICodeblockRunContext = {
	emoji: string | null;
	client: Client;
	guildId: string;
	channel: TextBasedChannel;
	userId: string;
	code: string;
	sourceMessage?: OptionalMessage;
};

export default interface ICodeblockHandler {
	id: string;
	// check against language name if it is supported by this handler
	test: RegExp;

	init?(): Promise<void>;

	// create reactions on the code block
	react(message: Message): Promise<void>;

	// run the codeblock handler with a given reaction emoji
	run(ctx: ICodeblockRunContext): Promise<void>;
}
