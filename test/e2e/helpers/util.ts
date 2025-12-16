import { browser } from '@wdio/globals';
import {
	BottomBarPanel,
	EditorView,
	Notification,
	OutputView,
	Workbench,
} from 'wdio-vscode-service';

export const dismissAllNotifications = async (): Promise<void> => {
	await browser.waitUntil(async (): Promise<boolean> => {
		const workbench: Workbench = await browser.getWorkbench();

		const notifications: Notification[] = await workbench.getNotifications();

		for (const notification of notifications) {
			await notification.dismiss();
		}

		const openNotifications: Notification[] =
			await workbench.getNotifications();

		return openNotifications.length === 0;
	});
};

export const waitForNpmRunToActivate = async (): Promise<void> => {
	await browser.waitUntil(async (): Promise<boolean> => {
		const workbench: Workbench = await browser.getWorkbench();

		const bottomBar: BottomBarPanel = workbench.getBottomBar();

		const outputView: OutputView = await bottomBar.openOutputView();

		outputView.locatorMap.BottomBarViews.outputChannels =
			'ul[aria-label="Output actions"] select';

		const channelNames: string[] = await outputView.getChannelNames();

		if (!channelNames.includes('NPM Run')) {
			return false;
		}

		await outputView.selectChannel('NPM Run');

		const outputLines: string[] = await outputView.getText();

		const isExtensionActive = outputLines.some((line: string) =>
			line.includes('[NPM Run]: Activated')
		);

		return isExtensionActive;
	});
};

export const closeAllOpenEditorTabs = async (): Promise<void> => {
	const workbench: Workbench = await browser.getWorkbench();

	const editorView: EditorView = workbench.getEditorView();

	await editorView.closeAllEditors();
};
