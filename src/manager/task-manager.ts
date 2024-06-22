import path from 'path';
import {
	ShellExecution,
	ShellQuotedString,
	ShellQuoting,
	Task,
	TaskDefinition,
	TaskGroup,
	Uri,
	WorkspaceFolder,
	workspace,
} from 'vscode';

// Code Referred from https://github.com/microsoft/vscode/blob/main/extensions/npm/src/tasks.ts

export interface INpmTaskDefinition extends TaskDefinition {
	script: string;
	path?: string;
}

const buildNames: string[] = ['build', 'compile', 'watch'];

const testNames: string[] = ['test'];

export class TaskManager {
	public async createTask(
		packageManager: string,
		script: INpmTaskDefinition | string,
		cmd: string[],
		folder: WorkspaceFolder,
		packageJsonUri: Uri,
		scriptValue?: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		matcher?: any
	): Promise<Task> {
		let kind: INpmTaskDefinition;

		if (typeof script === 'string') {
			kind = { type: 'npm', script: script };
		} else {
			kind = script;
		}

		function getCommandLine(cmd: string[]): (string | ShellQuotedString)[] {
			const result: (string | ShellQuotedString)[] = new Array(cmd.length);

			for (let i = 0; i < cmd.length; i++) {
				if (/\s/.test(cmd[i])) {
					result[i] = {
						value: cmd[i],
						quoting: cmd[i].includes('--')
							? ShellQuoting.Weak
							: ShellQuoting.Strong,
					};
				} else {
					result[i] = cmd[i];
				}
			}

			if (
				workspace.getConfiguration('npm', folder.uri).get<boolean>('runSilent')
			) {
				result.unshift('--silent');
			}

			return result;
		}

		function getRelativePath(packageJsonUri: Uri): string {
			const rootUri: Uri = folder.uri;

			const absolutePath: string = packageJsonUri.path.substring(
				0,
				packageJsonUri.path.length - 'package.json'.length
			);

			return absolutePath.substring(rootUri.path.length + 1);
		}

		const relativePackageJson: string = getRelativePath(packageJsonUri);

		if (relativePackageJson.length && !kind.path) {
			kind.path = relativePackageJson.substring(
				0,
				relativePackageJson.length - 1
			);
		}

		const taskName: string = this.getTaskName(kind.script, relativePackageJson);

		const cwd: string = path.dirname(packageJsonUri.fsPath);

		const task: Task = new Task(
			kind,
			folder,
			taskName,
			'npm',
			new ShellExecution(packageManager, getCommandLine(cmd), { cwd: cwd }),
			matcher
		);

		task.detail = scriptValue;

		const lowerCaseTaskName: string = kind.script.toLowerCase();

		if (this.isBuildTask(lowerCaseTaskName)) {
			task.group = TaskGroup.Build;
		} else if (this.isTestTask(lowerCaseTaskName)) {
			task.group = TaskGroup.Test;
		} else if (this.isPrePostScript(lowerCaseTaskName)) {
			task.group = TaskGroup.Clean; // hack: use Clean group to tag pre/post scripts
		} else if (scriptValue && this.isDebugScript(scriptValue)) {
			// todo@connor4312: all scripts are now debuggable, what is a 'debug script'?
			task.group = TaskGroup.Rebuild; // hack: use Rebuild group to tag debug scripts
		}

		return task;
	}

	private isBuildTask(name: string): boolean {
		for (const buildName of buildNames) {
			if (name.indexOf(buildName) !== -1) {
				return true;
			}
		}

		return false;
	}

	private isTestTask(name: string): boolean {
		for (const testName of testNames) {
			if (name === testName) {
				return true;
			}
		}

		return false;
	}

	private isPrePostScript(name: string): boolean {
		const prePostScripts: Set<string> = new Set([
			'preuninstall',
			'postuninstall',
			'prepack',
			'postpack',
			'preinstall',
			'postinstall',
			'prepack',
			'postpack',
			'prepublish',
			'postpublish',
			'preversion',
			'postversion',
			'prestop',
			'poststop',
			'prerestart',
			'postrestart',
			'preshrinkwrap',
			'postshrinkwrap',
			'pretest',
			'postest',
			'prepublishOnly',
		]);

		const prepost: string[] = ['pre' + name, 'post' + name];

		for (const knownScript of prePostScripts) {
			if (knownScript === prepost[0] || knownScript === prepost[1]) {
				return true;
			}
		}

		return false;
	}

	private isDebugScript(script: string): boolean {
		const match: RegExpMatchArray | null = script.match(
			// eslint-disable-next-line no-useless-escape
			/--(inspect|debug)(-brk)?(=((\[[0-9a-fA-F:]*\]|[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+|[a-zA-Z0-9\.]*):)?(\d+))?/
		);

		return match !== null;
	}

	private getTaskName(
		script: string,
		relativePath: string | undefined
	): string {
		if (relativePath && relativePath.length) {
			return `${script} - ${relativePath.substring(
				0,
				relativePath.length - 1
			)}`;
		}

		return script;
	}
}
