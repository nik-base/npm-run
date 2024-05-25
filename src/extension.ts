import {
	commands,
	DocumentSelector,
	ExtensionContext,
	languages,
	TextDocument,
	Disposable,
} from 'vscode';

import {
	IScriptInfo,
	NpmRunCodelensProvider,
} from './npm-run-codelens-provider';
import { CommandManager } from './command-manager';

const commandManager: CommandManager = new CommandManager();

export async function activate(context: ExtensionContext): Promise<void> {
	await registerNpmRunCodelens(context);

	registerRunCommand(context);
}

function registerNpmRunCodelens(context: ExtensionContext): void {
	const documentSelector: DocumentSelector = {
		language: 'json',
		pattern: '**/package.json',
	};

	const codeLensProviderDisposable: Disposable =
		languages.registerCodeLensProvider(
			documentSelector,
			new NpmRunCodelensProvider()
		);

	context.subscriptions.push(codeLensProviderDisposable);
}

function registerRunCommand(context: ExtensionContext): void {
	const run: Disposable = commands.registerCommand(
		'npm-run.run',
		async (document: TextDocument, scriptInfo: IScriptInfo): Promise<void> => {
			await commandManager.run(document, scriptInfo);
		}
	);

	context.subscriptions.push(run);
}

export function deactivate(context: ExtensionContext) {
	context.subscriptions?.forEach((disposable: Disposable): void =>
		disposable?.dispose()
	);
}
