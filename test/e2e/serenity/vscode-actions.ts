import { Ensure, equals } from '@serenity-js/assertions';
import { browser } from '@wdio/globals';
import {
	d,
	Task,
	Interaction,
	Activity,
	Expectation,
	Answerable,
} from '@serenity-js/core';
import { join } from 'path';
import {
	BottomBarPanel,
	CodeLens,
	EditorTab,
	EditorView,
	TerminalView,
	TextEditor,
	Workbench,
} from 'wdio-vscode-service';

export class VsCodeActions {
	static openPackageJsonFile = (example: string): Activity =>
		Task.where(
			d`#actor opens package.json file`,
			Interaction.where('open package.json', async (): Promise<void> => {
				const packageJsonFilePath: string = join(
					__dirname,
					`../examples/${example}/package.json`
				);

				await browser.executeWorkbench(
					async (vscode, packageJsonFilePath: string) => {
						const doc = await vscode.workspace.openTextDocument(
							vscode.Uri.file(packageJsonFilePath)
						);

						return vscode.window.showTextDocument(doc, {
							viewColumn: vscode.ViewColumn.Active,
						});
					},
					packageJsonFilePath
				);
			}),
			Ensure.eventually(this.#getActiveEditor(), equals('package.json'))
		);

	static clickRunScriptButton = (index: number): Activity =>
		Task.where(
			d`#actor clicks run script button`,
			Interaction.where('click run script button', async (): Promise<void> => {
				const codeLens: CodeLens = await this.#getCodeLens(index);

				await browser.pause(2000);

				console.log('Waiting for codelens run button...');

				const runButton$: WebdriverIO.Element = await codeLens.elem;

				console.log('Starting click...');

				await runButton$.click();

				console.log('Clicked');
			})
		);

	static #getEditorView = async (): Promise<EditorView> => {
		const workbench: Workbench = await browser.getWorkbench();

		const editorView: EditorView = workbench.getEditorView();

		return editorView;
	};

	static #getActiveEditor = async (): Promise<string> => {
		const editorView: EditorView = await this.#getEditorView();

		const activeEditor: EditorTab = await editorView.getActiveTab();

		return await activeEditor.getTitle();
	};

	static #getPackageJsonEditorTab = async (): Promise<TextEditor> => {
		const editorView: EditorView = await this.#getEditorView();

		await browser.pause(2000);

		const tab: TextEditor = (await editorView.openEditor(
			'package.json'
		)) as TextEditor;

		return tab;
	};

	static getCodeLenses = async (): Promise<CodeLens[]> => {
		const tab: TextEditor = await this.#getPackageJsonEditorTab();

		const codeLenses: CodeLens[] = await tab.getCodeLenses();

		return codeLenses;
	};

	static #getCodeLens = async (index: number): Promise<CodeLens> => {
		const codeLenses: CodeLens[] = await this.getCodeLenses();

		return codeLenses[index];
	};

	static getTerminalTabText = async (): Promise<string> => {
		console.log('Getting terminal tab text...');
		const workbench: Workbench = await browser.getWorkbench();

		console.log('Getting bottom bar...');
		const bottomBar: BottomBarPanel = workbench.getBottomBar();

		await browser.pause(6000);

		console.log('Opening terminal view...');
		const terminalView: TerminalView = await bottomBar.openTerminalView();

		console.log('Getting terminal text...');
		const terminalText: string = await terminalView.getText();

		console.log('Terminal text:', terminalText);

		return terminalText;
	};

	static hasNumberOfCodeLenses = (
		expected: Answerable<number>
	): Expectation<CodeLens[]> =>
		Expectation.thatActualShould<number, CodeLens[]>(
			'have number of code lenses',
			expected
		).soThat(
			(actualValue: CodeLens[], expectedValue: number): boolean =>
				actualValue.length === expectedValue
		);

	static codeLensTextAtIndexEquals = (
		index: number,
		expected: Answerable<string>
	): Expectation<CodeLens[]> =>
		Expectation.thatActualShould<string, CodeLens[]>(
			`code lens at index ${index} equals`,
			expected
		).soThat(
			async (
				actualValue: CodeLens[],
				expectedValue: string
			): Promise<boolean> => {
				const codeLens: CodeLens = actualValue[index];

				const codeLensText: string = await codeLens.getText();

				return codeLensText === expectedValue;
			}
		);

	static codeLensTooltipAtIndexEquals = (
		index: number,
		expected: Answerable<string>
	): Expectation<CodeLens[]> =>
		Expectation.thatActualShould<string, CodeLens[]>(
			`code lens at index ${index} equals`,
			expected
		).soThat(
			async (
				actualValue: CodeLens[],
				expectedValue: string
			): Promise<boolean> => {
				const codeLens: CodeLens = actualValue[index];

				const codeLensTooltip: string = await codeLens.getTooltip();

				return codeLensTooltip === expectedValue;
			}
		);
}
