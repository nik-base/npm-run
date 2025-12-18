export interface TestCase<TValue, TResult = never> {
	readonly description: string;
	readonly input: TValue;
	readonly expected: TResult | never;
}
