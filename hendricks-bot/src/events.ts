import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';

export type PluginEvents = {
	// === lifecycle ===
	// called after plugins completed init
	'plugins:init': () => void;
	// called to start plugins
	'plugins:start': () => void;

	// === registry events ===
	'register:commands': () => void;

	// comms
	message: (event: { sender: string; payload: any }) => void;
};

export type Events = TypedEventEmitter<PluginEvents>;

const events = new EventEmitter() as Events;

export default events;
