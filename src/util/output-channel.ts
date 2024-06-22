import {
	window,
	OutputChannel as vscodeOutputChannel,
	Disposable,
} from 'vscode';

export class OutputChannel implements Disposable {
	private outputChannel: vscodeOutputChannel;

	constructor(name = 'NPM Run') {
		this.outputChannel = window.createOutputChannel(name);
	}

	public log(message: string): void {
		this.outputChannel.appendLine(`[${this.outputChannel.name}]: ${message}`);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public logObject(data: any): void {
		if (!data) {
			this.outputChannel.appendLine(`[${this.outputChannel.name}]: ${data}`);

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
