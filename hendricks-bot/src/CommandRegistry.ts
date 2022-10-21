import ICommand from './types/ICommand';

export default class CommandRegistry {
	static commands: ICommand[] = [];

	static register(...c: ICommand[]) {
		this.commands.concat(c);
	}
}
