import type { Filter, LogicalFilterOR, LogicalFilterAND } from '@directus/types';

export function mergeFilters(
	filterA: Filter | null | undefined,
	filterB: Filter | null | undefined,
	strategy: 'and' | 'or' = 'and',
): Filter | null | undefined {
	if (!filterA) return filterB;
	if (!filterB) return filterA;

	return {
		[`_${strategy}`]: [filterA, filterB],
	} as LogicalFilterAND | LogicalFilterOR;
}
