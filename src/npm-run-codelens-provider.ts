import {
	CodeLens,
	TextDocument,
	CodeLensProvider,
	EventEmitter,
	Event,
	workspace,
	Command,
	TextLine,
	Disposable,
	l10n,
} from 'vscode';

export interface IScriptInfo {
	readonly name: string;
	readonly value: string;
}

export class NpmRunCodelensProvider implements CodeLensProvider, Disposable {
	private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();

	private disposables: Disposable[] = [];

	public readonly onDidChangeCodeLenses: Event<void> =
		this._onDidChangeCodeLenses.event;

	constructor() {
		const changeConfig: Disposable = workspace.onDidChangeConfiguration(
			(): void => {
				this._onDidChangeCodeLenses.fire();
			}
		);

		this.disposables.push(changeConfig);
	}

	public async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
		if (!this.isNpmRunEnabled()) {
			return [];
		}

		const lines: string[] = document.getText().split('\n');

		const scriptsStartedRegex: RegExp = new RegExp(
			'^\\s*"scripts"\\s*:\\s*{\\s*$'
		);

		const scriptsEndedRegex: RegExp = new RegExp('^\\s*}\\s*,\\s*$');

		const scriptCommandRegex: RegExp = new RegExp(
			'^\\s*"(.+)"\\s*:\\s*"(.+)"\\s*,?$'
		);

		let scriptStarted: boolean = false;

		let scriptEnded: boolean = false;

		const codeLenses: CodeLens[] = [];

		let lineNumber: number = 0;

		lines.forEach((line: string) => {
			lineNumber++;

			if (scriptEnded) {
				return;
			}

			const trimmedLine: string = line.trim();

			const started: boolean = scriptsStartedRegex.test(trimmedLine);
			if (started) {
				scriptStarted = true;

				return;
			}

			if (!scriptStarted) {
				return;
			}

			const ended: boolean = scriptsEndedRegex.test(trimmedLine);
			if (ended) {
				scriptEnded = true;

				return;
			}

			const matches: RegExpExecArray | null =
				scriptCommandRegex.exec(trimmedLine);

			if (!matches?.length || matches?.length < 3) {
				return;
			}

			const scriptName: string = matches[1];

			const scriptValue: string = matches[2];

			const scriptInfo: IScriptInfo = {
				name: scriptName,
				value: scriptValue,
			};

			const title: string = '$(run) ' + l10n.t('Run');

			const command: Command = {
				title,
				tooltip: `Run script '${scriptInfo.name}: ${scriptInfo.value}'`,
				command: 'npm-run.run',
				arguments: [document, scriptInfo],
			};

			const textLine: TextLine = document.lineAt(lineNumber - 1);

			const codeLens: CodeLens = new CodeLens(textLine.range, command);

			codeLenses.push(codeLens);
		});

		return codeLenses;
	}

	private isNpmRunEnabled(): boolean {
		return workspace.getConfiguration('npm-run').get('enable', true);
	}

	public dispose(): void {
		this.disposables?.forEach((disposable: Disposable): void =>
			disposable?.dispose()
		);
	}
}
