import { AudioPlayer } from '@discordjs/voice';

export default interface Scope {
	player?: AudioPlayer;
	queue: any[];
}
