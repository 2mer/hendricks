export default interface Plugin {
	id: string;
	init?(): Promise<void>;
	start(): void;
}
