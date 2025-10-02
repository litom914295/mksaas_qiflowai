const SENSITIVE_WORDS = ['违法', '诈骗', '仇恨', '恐怖', '暴力']

export function containsSensitive(input: unknown): boolean {
	if (typeof input !== 'string') return false
	const text = input.trim()
	if (!text) return false
	return SENSITIVE_WORDS.some((w) => text.includes(w))
}

export function assertNoSensitive(inputs: Array<unknown>) {
	for (const v of inputs) {
		if (containsSensitive(v)) {
			throw new Error('SENSITIVE_CONTENT')
		}
	}
}

