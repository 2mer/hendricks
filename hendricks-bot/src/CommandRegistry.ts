import Command from './types/Command';

export default class CommandRegistry {
	static commands: Command[] = [];

	static register(...c: Command[]) {
		this.commands.concat(c);
	}
}
