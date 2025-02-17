import { useStores } from '@directus/extensions-sdk';
import { Field, Relation } from '@directus/types';
import { AppCollection } from '@directus/types';
import { computed, Ref } from 'vue';

export type RelationM2M = {
	relation: Relation;
	relatedCollection: AppCollection;
	relatedPrimaryKeyField: Field;
	junctionCollection: AppCollection;
	junctionPrimaryKeyField: Field;
	junctionField: Field;
	reverseJunctionField: Field;
	junction: Relation;
	sortField?: string;
	type: 'm2m';
};

/*
One1              Many|Many: junctionCollection         One2: relatedCollection
┌─────────┐       ┌─────────────────────────────┐       ┌─────────────────────┐
│id       ├───┐   │id: junctionPKField          │   ┌───┤id: relatedPKField   │
│many     │   └──►│one1_id: reverseJunctionField│   │   │                     │
└─────────┘       │one2_id: junctionField       │◄──┘   └─────────────────────┘
                  │sort: sortField              │
                  └─────────────────────────────┘
 */

export function useRelationM2M(collection: Ref<string>, field: Ref<string>) {
	const { useRelationsStore, useCollectionsStore, useFieldsStore } = useStores();
	const relationsStore = useRelationsStore();
	const collectionsStore = useCollectionsStore();
	const fieldsStore = useFieldsStore();

	const relationInfo = computed<RelationM2M | undefined>(() => {
		const relations = relationsStore.getRelationsForField(collection.value, field.value);

		const junction = relations.find(
			(relation: any) =>
				relation.related_collection === collection.value &&
				relation.meta?.one_field === field.value &&
				relation.meta.junction_field,
		);

		if (!junction) return undefined;

		const relation = relations.find(
			(relation: any) => relation.collection === junction.collection && relation.field === junction.meta?.junction_field,
		);

		if (!relation) return undefined;

		return {
			relation: relation,
			relatedCollection: collectionsStore.getCollection(relation.related_collection as string),
			relatedPrimaryKeyField: fieldsStore.getPrimaryKeyFieldForCollection(relation.related_collection as string),
			sortField: junction.meta?.sort_field ?? undefined,
			junctionCollection: collectionsStore.getCollection(junction.collection),
			junctionPrimaryKeyField: fieldsStore.getPrimaryKeyFieldForCollection(junction.collection),
			junctionField: fieldsStore.getField(junction.collection, junction.meta?.junction_field as string),
			reverseJunctionField: fieldsStore.getField(junction.collection, relation.meta?.junction_field as string),
			junction: junction,
			type: 'm2m',
		} as RelationM2M;
	});

	return { relationInfo };
}
