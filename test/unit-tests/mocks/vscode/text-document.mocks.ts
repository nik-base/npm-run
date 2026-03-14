import { TextDocument, TextLine, Range, Uri } from 'vscode';
import { vi } from 'vitest';

export const createMockTextDocument = (
	content: string,
	fileName = 'package.json'
): TextDocument => {
	const lines = content.split('\n');

	return {
		getText: vi.fn(() => content),
		lineCount: lines.length,
		uri: { fsPath: fileName } as Uri,
		lineAt: vi.fn((line: number): TextLine => {
			const text = lines[line] || '';

			return {
				lineNumber: line,
				text: text,
				range: new Range(line, 0, line, text.length),
				isEmptyOrWhitespace: text.trim().length === 0,
				firstNonWhitespaceCharacterIndex: text.search(/\S|$/),
				rangeIncludingLineBreak: new Range(line, 0, line + 1, 0),
			} as TextLine;
		}),
		fileName: fileName,
		isDirty: false,
		isUntitled: false,
		save: vi.fn(),
	} as unknown as TextDocument;
};
