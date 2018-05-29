// dropdown control for filtering dashboards
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';
//import { TemplateVisTypeProvider } from 'ui/template_vis_type/template_vis_type';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';

VisTypesRegistryProvider.register(DropdownVisProvider);
require('plugins/multi-line/multiline.less');
require('plugins/multi-line/multilineController');
require('ui-select');
function DropdownVisProvider(Private) {
const VisFactory = Private(VisFactoryProvider);
const Schemas = Private(VisSchemasProvider);

//  const myResponseHandler = (vis, response) => {
//       // transform the response (based on vis object?)
//       console.log(response);
//       return response;
//    };

return VisFactory.createAngularVisualization({
	name: 'multiline',
	type: 'multiline',
	title: 'multiline Picker',
	icon: 'fa-caret-square-o-down',
	category: CATEGORY.OTHER,
	//responseHandler: myResponseHandler,
	description: 'In-dashboard dropdown filter widget',
	visConfig: {
		template: require('plugins/multi-line/multiline.html'),
		defaults: {
			
		}
	},
	editorConfig: {
		optionsTemplate: require('plugins/multi-line/multilineOption.html'),
		schemas: new Schemas([
			{
				group: 'metrics',
				name: 'count',
				title: 'Count',
				min: 1,
				max: 2,
				aggFilter: ['min','max']
			  },
			  {
				group: 'buckets',
				name: 'dropdownfield',
				title: 'Field to filter on',
				min: 1,
				max: 2,
				aggFilter: '!geohash_grid'
			  }
		])
		}
	});
}

export default DropdownVisProvider;

