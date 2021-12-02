import './main.scss';

// esri config and auth
import esriConfig from '@arcgis/core/config';

// loading screen
import LoadingScreen from './core/widgets/LoadingScreen';
import DisclaimerModal from './core/widgets/DisclaimerModal';

// map, view and layers
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { SimpleRenderer } from '@arcgis/core/renderers';
import { SimpleFillSymbol, TextSymbol } from '@arcgis/core/symbols';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import LabelClass from '@arcgis/core/layers/support/LabelClass';

import { DateTime } from 'luxon';

// layout
import Viewer from './core/layouts/Viewer';

// widgets
import ViewControl from './core/widgets/ViewControl';
import UIWidgetSwitcher from './core/widgets/UIWidgetSwitcher';
import LayerListLegend from './core/widgets/LayerListLegend';

// config portal and auth
esriConfig.portalUrl = 'https://gisportal.vernonia-or.gov/portal';

// app config and init loading screen
const title = 'Vernonia Annexations';

const loadingScreen = new LoadingScreen({
  title,
});

if (!DisclaimerModal.isAccepted()) {
  new DisclaimerModal({});
}

const annexations = new GeoJSONLayer({
  url: 'https://vernonia-annexation-documents.netlify.app/vernonia-annexations.geojson',
  outFields: ['*'],
  title: 'Annexations',
  renderer: new SimpleRenderer({
    symbol: new SimpleFillSymbol({
      color: [255, 0, 0, 0.1],
      outline: {
        style: 'solid',
        color: 'red',
        width: 1,
      },
    }),
  }),
  labelingInfo: [
    new LabelClass({
      symbol: new TextSymbol({
        color: 'red',
        haloColor: 'white',
        haloSize: 1,
        font: {
          size: 7
        },
      }),
      labelPlacement: 'above-center',
      labelExpressionInfo: {
        expression: '$feature.GIS_IMAGE + TextFormatting.NewLine + ISOMonth(Date($feature.DateComple)) + "/" + Day(Date($feature.DateComple)) + "/" + ISOYear(Date($feature.DateComple))',
      }
    }),
  ],
  popupTemplate: new PopupTemplate({
    title: 'Annexation',
    content: (event: any) => {
      const {
        graphic: { attributes },
      } = event;

      const CSS = {
        table: 'esri-widget__table',
        th: 'esri-feature__field-header',
        td: 'esri-feature__field-data',
      };

      return (document.createElement('div').innerHTML = `
        <table class="${CSS.table}">
          <tr>
            <th class="${CSS.th}">Date</th>
            <td class="${CSS.td}">${DateTime.fromMillis(attributes.DateComple).toLocaleString(DateTime.DATE_SHORT)}</td>
          </tr>
          <tr>
            <th class="${CSS.th}">Documents</th>
            <td class="${CSS.td}">
              <a href="https://vernonia-annexation-documents.netlify.app/docs/${attributes.GIS_IMAGE}.pdf" target="_blank">View ${attributes.GIS_IMAGE}.pdf</a>
            </td>
          </tr>
        </table>
      `);
    },
  }),
});

const cityLimits = new FeatureLayer({
  portalItem: {
    id: 'eb0c7507611e44b7923dd1c0167e3b92',
  },
});

const ugb = new FeatureLayer({
  portalItem: {
    id: '2f760ba990ab4d6e831d04b85a8a0bf3',
  },
});

// view
const view = new MapView({
  map: new Map({
    basemap: new Basemap({
      portalItem: {
        id: 'f36cd213cc934d2391f58f389fc9eaec',
      },
    }),
    layers: [annexations, ugb, cityLimits],
    ground: 'world-elevation',
  }),
  zoom: 15,
  center: [-123.18291178267039, 45.8616094153766],
  constraints: {
    rotationEnabled: false,
  },
  popup: {
    dockEnabled: true,
    dockOptions: {
      position: 'bottom-left',
      breakpoint: false,
    },
  },
});

new Viewer({
  view,
  title,
  includeSearch: false,
});

view.when(() => {
  view.ui.add(new ViewControl({ view }), 'top-left');

  view.ui.add(
    new UIWidgetSwitcher({
      widgetInfos: [
        {
          widget: new LayerListLegend({
            view,
            addFromWeb: false,
          }),
          text: 'Layers',
          icon: 'layers',
        }
      ]
    }),
    'top-right',
  );

  loadingScreen.end();
});
