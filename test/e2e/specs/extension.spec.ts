import { actorCalled } from '@serenity-js/core';
import { Ensure, and, includes } from '@serenity-js/assertions';

import {
	closeAllOpenEditorTabs,
	dismissAllNotifications,
	waitForNpmRunToActivate,
} from '../helpers/util';
import { VsCodeActions } from '../serenity/vscode-actions';

describe('NPM Run Extension', () => {
	before('should finish loading the extension', async function () {
		this.timeout(30000);

		await browser.pause(5000);

		await dismissAllNotifications();

		await waitForNpmRunToActivate();
	});

	beforeEach(async function () {
		await closeAllOpenEditorTabs();

		await dismissAllNotifications();
	});

	it('when package.json is empty', async function () {
		await actorCalled('Alice').attemptsTo(
			VsCodeActions.openPackageJsonFile('empty'),
			Ensure.eventually(
				VsCodeActions.getCodeLenses(),
				VsCodeActions.hasNumberOfCodeLenses(0)
			)
		);
	});

	it('when package.json has no scripts', async function () {
		await actorCalled('Alice').attemptsTo(
			VsCodeActions.openPackageJsonFile('no-scripts'),
			Ensure.eventually(
				VsCodeActions.getCodeLenses(),
				VsCodeActions.hasNumberOfCodeLenses(0)
			)
		);
	});

	it('when package.json has empty scripts', async function () {
		await actorCalled('Alice').attemptsTo(
			VsCodeActions.openPackageJsonFile('empty-scripts'),
			Ensure.eventually(
				VsCodeActions.getCodeLenses(),
				VsCodeActions.hasNumberOfCodeLenses(1)
			)
		);
	});

	it('when package.json has one script', async function () {
		await actorCalled('Alice').attemptsTo(
			VsCodeActions.openPackageJsonFile('one-script'),
			Ensure.eventually(
				VsCodeActions.getCodeLenses(),
				and(
					VsCodeActions.hasNumberOfCodeLenses(2),
					VsCodeActions.codeLensTextAtIndexEquals(1, 'Run'),
					VsCodeActions.codeLensTooltipAtIndexEquals(
						1,
						`Run script 'echo_test: echo test'`
					)
				)
			)
		);

		await actorCalled('Alice').attemptsTo(
			VsCodeActions.clickRunScriptButton(1),
			Ensure.eventually(
				VsCodeActions.getTerminalTabText(),
				includes('npm run echo_test')
			)
		);
	});

	it('when package.json has many scripts', async function () {
		await actorCalled('Alice').attemptsTo(
			VsCodeActions.openPackageJsonFile('many-scripts'),
			Ensure.eventually(
				VsCodeActions.getCodeLenses(),
				and(
					VsCodeActions.hasNumberOfCodeLenses(5),
					VsCodeActions.codeLensTextAtIndexEquals(1, 'Run'),
					VsCodeActions.codeLensTooltipAtIndexEquals(
						1,
						`Run script 'echo_test1: echo test1'`
					),
					VsCodeActions.codeLensTextAtIndexEquals(2, 'Run'),
					VsCodeActions.codeLensTooltipAtIndexEquals(
						2,
						`Run script 'echo_test2: echo test2'`
					),
					VsCodeActions.codeLensTextAtIndexEquals(3, 'Run'),
					VsCodeActions.codeLensTooltipAtIndexEquals(
						3,
						`Run script 'echo_test3: echo test3'`
					),
					VsCodeActions.codeLensTextAtIndexEquals(4, 'Run'),
					VsCodeActions.codeLensTooltipAtIndexEquals(
						4,
						`Run script 'echo_test4: echo test4'`
					)
				)
			)
		);

		await actorCalled('Alice').attemptsTo(
			VsCodeActions.clickRunScriptButton(1),
			Ensure.eventually(
				VsCodeActions.getTerminalTabText(),
				includes('npm run echo_test1')
			)
		);

		await browser.keys('Escape');

		await actorCalled('Alice').attemptsTo(
			VsCodeActions.clickRunScriptButton(2),
			Ensure.eventually(
				VsCodeActions.getTerminalTabText(),
				includes('npm run echo_test2')
			)
		);

		await actorCalled('Alice').attemptsTo(
			VsCodeActions.clickRunScriptButton(3),
			Ensure.eventually(
				VsCodeActions.getTerminalTabText(),
				includes('npm run echo_test3')
			)
		);

		await actorCalled('Alice').attemptsTo(
			VsCodeActions.clickRunScriptButton(4),
			Ensure.eventually(
				VsCodeActions.getTerminalTabText(),
				includes('npm run echo_test4')
			)
		);
	});
});
