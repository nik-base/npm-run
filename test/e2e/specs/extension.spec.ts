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
		this.timeout(60000); // Increase timeout

		try {
			console.log('⏳ Waiting for VS Code to stabilize...');
			await global.browser.pause(5000);

			console.log('⏳ Dismissing notifications...');
			// await dismissAllNotifications();

			console.log('⏳ Waiting for NPM Run extension to activate...');
			await waitForNpmRunToActivate();

			console.log('✅ Extension activated successfully!');
		} catch (error) {
			console.error('❌ Extension activation failed:', error);

			// Take a screenshot for debugging
			const workbench = await global.browser.getWorkbench();
			await global.browser.saveScreenshot(
				'./test/e2e/logs/activation-failure.png'
			);

			throw error;
		}
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
	});
});
