import ICommand from "../types/ICommand";
import createLabeledLogger from "src/Logger";
import { Logger } from "winston";
import Hendricks from "src/Hendricks";



export default abstract class Plugin {
	logger: Logger;

	constructor() {
		this.logger = createLabeledLogger(this.displayName)
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async init(hendricks: Hendricks): Promise<void> {
		// do nothing by default
	}

	abstract get id(): string;

	get displayName() {
		return this.id;
	}

	get commands(): ICommand[] {
		return [];
	}
}