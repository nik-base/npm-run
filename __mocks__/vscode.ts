import { vi } from 'vitest';

export class EventEmitter {
	event = vi.fn();
	fire = vi.fn();
	dispose = vi.fn();
}

export class Disposable {
	dispose = vi.fn();
}

export class CodeLens {
	constructor(
		public range: unknown,
		public command: unknown
	) {}
}

export class Range {
	constructor(
		public start: unknown,
		public end: unknown
	) {}
}

export class Position {
	constructor(
		public line: number,
		public character: number
	) {}
}

export const window = {
	createTextEditorDecorationType: vi.fn(),
	showInformationMessage: vi.fn(),
	showErrorMessage: vi.fn(),
	showWarningMessage: vi.fn(),
	createOutputChannel: vi.fn(() => ({
		appendLine: vi.fn(),
		show: vi.fn(),
		dispose: vi.fn(),
	})),
};

export const workspace = {
	getConfiguration: vi.fn(() => ({
		get: vi.fn((key: string) => (key === 'enable' ? true : undefined)),
		update: vi.fn(),
	})),
	onDidChangeConfiguration: vi.fn(),
};

export const languages = {
	registerCodeLensProvider: vi.fn(),
};

export const commands = {
	registerCommand: vi.fn(),
	executeCommand: vi.fn(),
};

export const l10n = {
	t: vi.fn((message: string | { message: string }) => {
		const msg = typeof message === 'string' ? message : message.message;

		return msg;
	}),
};

export default {
	window,
	workspace,
	languages,
	commands,
	l10n,
	EventEmitter,
	Disposable,
	CodeLens,
	Range,
	Position,
};
