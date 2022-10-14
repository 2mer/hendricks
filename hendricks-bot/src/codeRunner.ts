import { TextBasedChannel } from "discord.js";
import vm from "vm";

var contexts: Map<string, any> = new Map();

function getOrCreateContext(guildId: string): any {
	let ctx = contexts.get(guildId);
	if (ctx == null) {
		ctx = {
			session: {
				guildId,
				userToChannel: new Map<string, TextBasedChannel>(),
			},
			debug: console.log
		};
		contexts.set(guildId, vm.createContext(ctx));
	}
	return ctx;
}

export default function run(guildId: string, channel: TextBasedChannel, userId: string, code: String) {
	// get the context and set the current channel to the current user
	const context = getOrCreateContext(guildId);
	context.session.userToChannel.set(userId, channel);

	// run
	const completeCode = `
		var log = async (data) => {
			const channel = session.userToChannel.get('${userId}');
			await channel.send('' + data);
		}\n`+
		code;
	vm.runInContext(completeCode, context);
}
