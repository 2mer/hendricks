import Command from './Command';

export default interface Plugin {
	id: string;
	init?(): Promise<void>;
	start?(): void;
	commands?: Command[];
}
