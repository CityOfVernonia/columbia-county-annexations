import './main.scss';

import esriConfig from '@arcgis/core/config';
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
import Layout from '@vernonia/core/dist/Layout';
import '@vernonia/core/dist/Layout.css';

// config portal and auth
esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';

// app config and init loading screen
const title = 'Vernonia Annexations';

// basemaps
const basemap = new Basemap({
  portalItem: {
    id: '6e9f78f3a26f48c89575941141fd4ac3',
  },
});

const nextBasemap = new Basemap({
  portalItem: {
    id: '2622b9aecacd401583981410e07d5bb9',
  },
});

const annexations = new GeoJSONLayer({
  url: 'https://vernonia-annexation-documents.netlify.app/vernonia-annexations.geojson',
  outFields: ['*'],
  title: 'Annexations',
  renderer: new SimpleRenderer({
    symbol: new SimpleFillSymbol({
      color: [0, 0, 255, 0.1],
      outline: {
        style: 'solid',
        color: [0, 0, 255, 0.25],
        width: 1,
      },
    }),
  }),
  labelingInfo: [
    new LabelClass({
      symbol: new TextSymbol({
        color: 'blue',
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
    id: '5e1e805849ac407a8c34945c781c1d54',
  },
});

const ugb = new FeatureLayer({
  portalItem: {
    id: '0df1d0d9f7aa45099881c6de540950c8',
  },
});

// view
const view = new MapView({
  map: new Map({
    basemap,
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

// const info = document.createElement('calcite-panel');
// info.setAttribute('style', 'border-radius: var(--calcite-border-radius);');
// info.widthScale = 'm';
// const content = document.createElement('div');
// content.setAttribute('style', 'padding: 0.75rem;');
// info.append(content);
// content.innerHTML = ``;
// view.ui.add(info, 'top-right');

new Layout({
  view,
  loaderOptions: {
    title,
  },
  includeDisclaimer: true,
  mapHeadingOptions: {
    title,
    logoUrl: 'city_logo_small_white.svg',
  },
  nextBasemap,
});
