import { defineInterface } from '@directus/extensions';
import Interface from './interface.vue';
// import PreviewSVG from './preview.svg?raw';

export default defineInterface({
	id: 'file-import',
	name: 'File Import',
	description: 'Interface File with enable import option',
	icon: 'note_add',
	component: Interface,
	types: ['uuid'],
	localTypes: ['file'],
	group: 'relational',
	relational: true,
	options: [
		{
			field: 'folder',
			name: '$t:interfaces.system-folder.folder',
			type: 'uuid',
			meta: {
				width: 'full',
				interface: 'system-folder',
				note: '$t:interfaces.system-folder.field_hint',
			},
		},
		{
			field: 'enableImport',
			name: '$t:label_import',
			schema: {
				default_value: true,
			},
			meta: {
				interface: 'boolean',
				width: 'half',
			},
		},
	],
	recommendedDisplays: ['file'],
	// preview: PreviewSVG,
});
