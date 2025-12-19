import { describe, test, expect, beforeEach, vi } from 'vitest';
import { NpmRunCodelensProvider } from './npm-run-codelens-provider';
import { CodeLens, Command, TextDocument, window } from 'vscode';
import { NpmRunOutputChannel } from '../util/npm-run-output-channel';
import { createMockTextDocument } from '../../test/unit-tests/mocks/vscode/text-document.mocks';
import { TestCase } from '../../test/unit-tests/models';

describe('NPM Run Codelens provider ', () => {
	let npmRunCodelensProvider: NpmRunCodelensProvider;

	beforeEach(() => {
		npmRunCodelensProvider = new NpmRunCodelensProvider(
			new NpmRunOutputChannel()
		);
	});

	describe('code lenses', () => {
		const empty = '';

		const emptyScripts = `{
    		"name": "empty-scripts",
    		"version": "1.0.0",
		    "scripts": {
    		},
    		"description": "Empty Scripts"
		}`;

		const noScript = `{
    		"name": "no-scripts",
    		"version": "1.0.0",
    		"description": "No Scripts"
		}`;

		const oneScript = `{
    		"name": "one-script",
    		"version": "1.0.0",
    		"scripts": {
        		"echo_test": "echo test"
    		},
    		"description": "One Script"
		}`;

		const manyScripts = `{
    		"name": "many-scripts",
    		"version": "1.0.0",
    		"scripts": {
        		"echo_test1": "echo test1",
        		"echo_test2": "echo test2",
        		"echo_test3": "echo test3",
        		"echo_test4": "echo test4"
    		},
    		"description": "Many Scripts"
		}`;

		const emptyTextDocument: TextDocument = createMockTextDocument(empty);

		const emptyScriptsTextDocument: TextDocument =
			createMockTextDocument(emptyScripts);

		const noScriptTextDocument: TextDocument = createMockTextDocument(noScript);

		const oneScriptTextDocument: TextDocument =
			createMockTextDocument(oneScript);

		const manyScriptsTextDocument: TextDocument =
			createMockTextDocument(manyScripts);

		const createCodeLens = (
			name: string,
			value: string,
			document: TextDocument,
			line: number
		): CodeLens => {
			const command: Command = {
				title: '$(run) Run',
				tooltip: `Run script '${name}: ${value}'`,
				command: 'npm-run.run',
				arguments: [document, { name, value }],
			};

			return new CodeLens(document.lineAt(line).range, command);
		};

		const testCases: TestCase<TextDocument, CodeLens[]>[] = [
			{
				description: 'is empty',
				input: emptyTextDocument,
				expected: [],
			},
			{
				description: 'is empty',
				input: emptyTextDocument,
				expected: [],
			},
			{
				description: 'has no scripts',
				input: noScriptTextDocument,
				expected: [],
			},
			{
				description: 'has empty scripts',
				input: emptyScriptsTextDocument,
				expected: [],
			},
			{
				description: 'has one script',
				input: oneScriptTextDocument,
				expected: [
					createCodeLens('echo_test', 'echo test', oneScriptTextDocument, 4),
				],
			},
			{
				description: 'has many scripts',
				input: manyScriptsTextDocument,
				expected: [
					createCodeLens(
						'echo_test1',
						'echo test1',
						manyScriptsTextDocument,
						4
					),
					createCodeLens(
						'echo_test2',
						'echo test2',
						manyScriptsTextDocument,
						5
					),
					createCodeLens(
						'echo_test3',
						'echo test3',
						manyScriptsTextDocument,
						6
					),
					createCodeLens(
						'echo_test4',
						'echo test4',
						manyScriptsTextDocument,
						7
					),
				],
			},
		];

		test.each(testCases)(
			'should calculate codelenses when package.json $description',
			({ input, expected }: TestCase<TextDocument, CodeLens[]>) => {
				expect(npmRunCodelensProvider.provideCodeLenses(input)).toEqual(
					expected
				);
			}
		);

		it('should return empty codelenses and show error message when package.json is NOT valid', () => {
			const invalid = '{';

			const textDocument: TextDocument = createMockTextDocument(invalid);

			vi.spyOn(window, 'showErrorMessage');

			expect(npmRunCodelensProvider.provideCodeLenses(textDocument)).toEqual(
				[]
			);

			expect(window.showErrorMessage).toHaveBeenCalledWith(
				'NPM Run: Failed to parse package.json'
			);
		});
	});
});
