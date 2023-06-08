import './main.scss';

// esri config and auth
import esriConfig from '@arcgis/core/config';

// map and view
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';

// application
import MapApplication from '@vernonia/map-application/dist/MapApplication';

// config portal and auth
esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';

const load = async () => {
  // layers and friends
  const { extents, hillshadeBasemap, hybridBasemap, cityLimits, ugb, annexations } = await import('./layers');
  const { extent, constraintGeometry } = await extents();

  // view
  const view = new MapView({
    map: new Map({
      basemap: hillshadeBasemap,
      layers: [annexations, ugb, cityLimits],
      ground: 'world-elevation',
    }),
    extent,
    constraints: {
      geometry: constraintGeometry,
      minScale: 40000,
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

  // application
  new MapApplication({
    contentBehind: true,
    title: 'Vernonia Annexations',
    nextBasemap: hybridBasemap,
    panelPosition: 'end',
    view,
    viewControlOptions: {
      includeLocate: true,
      includeFullscreen: true,
    },
  });
};

load();
