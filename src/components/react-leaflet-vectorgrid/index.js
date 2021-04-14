import {
  LayerProps,
  createTileLayerComponent,
  updateGridLayer,
  withPane,
} from '@react-leaflet/core'

import L from "leaflet";
import VectorGrid from '@bagage/leaflet.vectorgrid'

export const VectorTile = createTileLayerComponent(
  function createVectorTileLayer({ url, ...options }, context) {
    const instance = L.vectorGrid.protobuf(url,
      {
        interactive: true,
        getFeatureId: function(f) {
          // console.log('getFeatureId', f);
          return f.properties.id;
        },
        vectorTileLayerStyles: {
          adhoc: {
            weight: 0,
            fillColor: '#ff0000',
            fillOpacity: 0.5,
            fill: true
          },
          occurrence: function(properties, zoom, geometryDimension) {
            // geometeryDimension
            // 1 = point
            // 2 = line
            // 3 = polygon
            // console.log(`drawing tile`, properties, zoom, geometryDimension)
            if (geometryDimension === 1) {
              return {
                icon: new L.Icon.Default()
              }
            } else {
              return {
                weight: 1,//, //properties.total,
                fillColor: '#ff0000',
                fillOpacity: 0.5,
                fill: true
              }
            }
          }
        },
        // maxNativeZoom: 14
      })
    
      instance.on('click', (ev) => console.log(ev))

    return {
      instance,
      context,
    }
  },  
  function updateVectorLayer(layer, props, prevProps) {
    const {url} = props;
    if (url != null && url !== prevProps.url) {
      console.log('Setting layer url', url);
      layer.setUrl(url);
    }
    return updateGridLayer(...arguments);
  }
)