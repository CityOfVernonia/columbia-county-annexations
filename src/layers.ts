import esri = __esri;
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { SimpleRenderer } from '@arcgis/core/renderers';
import { SimpleFillSymbol, TextSymbol } from '@arcgis/core/symbols';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import LabelClass from '@arcgis/core/layers/support/LabelClass';
import { DateTime } from 'luxon';

// basemaps
export const hillshadeBasemap = new Basemap({
  portalItem: {
    id: '6e9f78f3a26f48c89575941141fd4ac3',
  },
});

export const hybridBasemap = new Basemap({
  portalItem: {
    id: '2622b9aecacd401583981410e07d5bb9',
  },
});

// layers
export const cityLimits = new FeatureLayer({
  portalItem: {
    id: '5e1e805849ac407a8c34945c781c1d54',
  },
});

export const ugb = new FeatureLayer({
  portalItem: {
    id: '0df1d0d9f7aa45099881c6de540950c8',
  },
});

export const annexations = new GeoJSONLayer({
  url: '/annexations/annexations.geojson',
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
          size: 7,
        },
      }),
      labelPlacement: 'above-center',
      labelExpressionInfo: {
        expression:
          '$feature.GIS_IMAGE + TextFormatting.NewLine + ISOMonth(Date($feature.DateComple)) + "/" + Day(Date($feature.DateComple)) + "/" + ISOYear(Date($feature.DateComple))',
      },
    }),
  ],
  popupTemplate: new PopupTemplate({
    title: 'Annexation {GIS_IMAGE}',
    content: (event: any) => {
      const {
        graphic: { attributes },
      } = event;

      const CSS = {
        table: 'esri-widget__table',
      };

      const doc = document.createElement('div');

      doc.innerHTML = `
        <table class="${CSS.table}">
          <tr>
            <th>Date</th>
            <td>${DateTime.fromMillis(attributes.DateComple).toLocaleString(DateTime.DATE_SHORT)}</td>
          </tr>
          <tr>
            <th>Documents</th>
            <td>
              <calcite-link href="${document.location.origin}/annexations/${
        attributes.GIS_IMAGE
      }.pdf" target="_blank">View ${attributes.GIS_IMAGE}.pdf</calcite-link>
            </td>
          </tr>
        </table>
      `;

      return doc.querySelector('table');
    },
  }),
});

/**
 * Return extents for view.
 * @returns extent and constraint geometry
 */
export const extents = async (): Promise<{ extent: esri.Extent; constraintGeometry: esri.Extent }> => {
  await cityLimits.load();
  const extent = cityLimits.fullExtent.clone();
  return {
    extent,
    constraintGeometry: extent.clone().expand(3),
  };
};
