import { ConfidenceBadge as UnifiedConfidenceBadge } from '../confidence-indicator'

export function ConfidenceBadge(props: { value: number }) {
	return <UnifiedConfidenceBadge confidence={props.value} />
}

