import {
	Task,
	TextDocument,
	Uri,
	WorkspaceFolder,
	commands,
	extensions,
	tasks,
	workspace,
} from 'vscode';

import { IScriptInfo } from './npm-run-codelens-provider';
import { TaskManager } from './task-manager';

export class CommandManager {
	private readonly taskManager: TaskManager = new TaskManager();

	public async run(
		document: TextDocument,
		scriptInfo: IScriptInfo
	): Promise<void> {
		await this.activateNpm();

		const workspaceFolder: WorkspaceFolder | undefined =
			workspace.getWorkspaceFolder(document.uri);

		const packageManager: string = await this.getPackageManager(
			workspaceFolder?.uri
		);

		await this.runScript(
			scriptInfo.name,
			packageManager,
			document,
			workspaceFolder
		);
	}

	public async runScript(
		script: string,
		packageManager: string,
		document: TextDocument,
		workspaceFolder: WorkspaceFolder | undefined
	) {
		const uri: Uri = document.uri;

		if (!workspaceFolder) {
			return;
		}

		const task: Task = await this.taskManager.createTask(
			packageManager,
			script,
			['run', script],
			workspaceFolder,
			uri
		);

		await tasks.executeTask(task);
	}

	public async activateNpm(): Promise<void> {
		return extensions.getExtension('vscode.npm')?.activate();
	}

	public async getPackageManager(uri: Uri | undefined): Promise<string> {
		const packageManager: string | null | undefined =
			await commands.executeCommand('npm.packageManager', uri);

		return packageManager || 'npm';
	}
}
