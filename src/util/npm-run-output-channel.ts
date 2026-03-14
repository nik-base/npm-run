import { window, OutputChannel, Disposable } from 'vscode';

export class NpmRunOutputChannel implements Disposable {
	private readonly outputChannel: OutputChannel;

	constructor(name = 'NPM Run') {
		this.outputChannel = window.createOutputChannel(name);
	}

	public log(message: string): void {
		this.outputChannel.appendLine(`[${this.outputChannel.name}]: ${message}`);
	}

	public logObject(data: unknown): void {
		if (!data) {
			this.outputChannel.appendLine(
				`[${this.outputChannel.name}]: ${String(data)}`
			);

			return;
		}

		this.outputChannel.appendLine(
			`[${this.outputChannel.name}]: ${JSON.stringify(data)}`
		);
	}

	public dispose() {
		this.outputChannel.dispose();
	}
}
