import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			vscode: path.resolve(__dirname, '__mocks__/vscode.ts'),
		},
	},
	test: {
		globals: true,
		setupFiles: ['./vitest.setup.ts'],
		environment: 'node',
		include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
		exclude: ['dist/**', 'out/**', 'test/e2e/**', 'node_modules/**'],

		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'lcov', 'html'],
			reportsDirectory: './coverage',
			include: ['src/**/*.ts'],
			exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/test/**'],
		},
	},
});
