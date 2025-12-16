import {
	CodeLens,
	TextDocument,
	CodeLensProvider,
	EventEmitter,
	Event,
	workspace,
	Command,
	Disposable,
	l10n,
	window,
} from 'vscode';
import { OutputChannel } from '../util/output-channel';

export interface IScriptInfo {
	readonly name: string;
	readonly value: string;
}

export class NpmRunCodelensProvider implements CodeLensProvider, Disposable {
	private readonly _onDidChangeCodeLenses: EventEmitter<void> =
		new EventEmitter<void>();

	// eslint-disable-next-line @typescript-eslint/member-ordering
	public readonly onDidChangeCodeLenses: Event<void> =
		this._onDidChangeCodeLenses.event;

	private readonly disposables: Disposable[] = [];

	constructor(private readonly outputChannel: OutputChannel) {
		const changeConfig: Disposable = workspace.onDidChangeConfiguration(
			(): void => {
				this._onDidChangeCodeLenses.fire();
			}
		);

		this.disposables.push(changeConfig);
	}

	public provideCodeLenses(document: TextDocument): CodeLens[] {
		if (!this.isNpmRunEnabled()) {
			return [];
		}

		try {
			const packageJsonString: string | undefined = document.getText();

			if (!packageJsonString) {
				return [];
			}

			const packageJson: Record<string, unknown> | undefined = JSON.parse(
				packageJsonString
			) as Record<string, unknown> | undefined;

			const scripts: Record<string, unknown> | undefined = packageJson?.[
				'scripts'
			] as Record<string, unknown> | undefined;

			if (!scripts || typeof scripts !== 'object') {
				return [];
			}

			const codeLenses: CodeLens[] = [];

			// Find the scripts object position in the document
			const text = document.getText();
			const scriptsMatch = text.match(/"scripts"\s*:\s*{/);

			if (scriptsMatch?.index === undefined) {
				return [];
			}

			// Calculate line offset for scripts section
			const beforeScripts = text.substring(0, scriptsMatch.index);
			const startLine = beforeScripts.split('\n').length - 1;

			Object.entries(scripts).forEach(([name, value], index) => {
				if (typeof value !== 'string') {
					return;
				}

				const lineNumber = startLine + index + 1;
				// Add bounds checking
				if (lineNumber >= document.lineCount) {
					return;
				}

				const textLine = document.lineAt(lineNumber);
				// Verify this line actually contains the script
				if (!textLine.text.includes(name)) {
					return;
				}

				const scriptInfo: IScriptInfo = { name, value };
				const command: Command = {
					title: '$(run) ' + l10n.t('Run'),
					tooltip: `Run script '${name}: ${value}'`,
					command: 'npm-run.run',
					arguments: [document, scriptInfo],
				};

				codeLenses.push(new CodeLens(textLine.range, command));
			});

			return codeLenses;
		} catch (error: unknown) {
			// Log error but don't break the extension
			const message = 'Failed to parse package.json';

			console.error(`${message}:`, error);

			this.outputChannel.log(`${message}: ${String(error)}`);

			window.showErrorMessage(`NPM Run: ${message}`);

			return [];
		}
	}

	public dispose(): void {
		this._onDidChangeCodeLenses.dispose();

		this.disposables.forEach((disposable: Disposable): void => {
			disposable.dispose();
		});
	}

	private isNpmRunEnabled(): boolean {
		return workspace.getConfiguration('npm-run').get('enable', true);
	}
}
