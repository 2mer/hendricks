export type IAwaitable<T = void> = Promise<T> & {
	resolve: (v: T) => void;
	reject: (e?: Error) => void;
};

export default function Awaitable<T = void>() {
	let _resolve, _reject;
	const p = new Promise((resolve, reject) => {
		_resolve = resolve;
		_reject = reject;
	});

	Object.assign(p, { resolve: _resolve, reject: _reject });

	return p as IAwaitable<T>;
}
