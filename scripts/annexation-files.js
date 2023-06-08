import fs from 'fs-extra';
import util from 'node:util';
import { exec } from 'child_process';
import { queryFeatures } from '@esri/arcgis-rest-feature-service';
import download from 'download';

const _exec = util.promisify(exec);

const serviceUrl =
  'https://gis.columbiacountymaps.com/server/rest/services/Land_Development/Land_Use_Planning/FeatureServer/3';

const imageUrl = 'https://gis.columbiacountymaps.com/annex_images/';

const vernoniaSpatialExtent = {
  rings: [
    [
      [606952.056605339, 1490512.4505739063],
      [606952.056605339, 1529343.4065166563],
      [650728.9227023721, 1529343.4065166563],
      [650728.9227023721, 1490512.4505739063],
      [606952.056605339, 1490512.4505739063],
    ],
  ],
  spatialReference: { wkid: 102970, latestWkid: 6557 },
};

const processFeature = async (feature) => {
  const { IMAGE } = feature.properties;

  const tiffFile = `src/public/annexations/${IMAGE}`;

  const pdfFile = `src/public/annexations/${IMAGE.replace('tiff', 'pdf').replace('tif', 'pdf')}`;

  const exists = await fs.exists(pdfFile);

  if (exists) return;

  const data = await download(`${imageUrl}${IMAGE}`);

  await fs.writeFile(tiffFile, data);

  await _exec(`tiff2pdf -z -o ${pdfFile} ${tiffFile}`);

  await fs.remove(tiffFile);
};

const query = async () => {
  const geojson = await queryFeatures({
    url: serviceUrl,
    geometry: vernoniaSpatialExtent,
    returnGeometry: true,
    outFields: ['*'],
    spatialRel: 'esriSpatialRelIntersects',
    geometryType: 'esriGeometryPolygon',
    f: 'geojson',
  });

  geojson.features.forEach(async (feature) => {
    await processFeature(feature);
  });

  fs.writeFile('src/public/annexations/annexations.geojson', JSON.stringify(geojson));
};

query();
