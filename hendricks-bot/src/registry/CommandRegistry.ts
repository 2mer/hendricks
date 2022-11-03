import ICommand from '../types/ICommand';

export default class CommandRegistry {
	commands: ICommand[] = [];

	register(...c: ICommand[]) {
		this.commands = this.commands.concat(c);
	}
}
