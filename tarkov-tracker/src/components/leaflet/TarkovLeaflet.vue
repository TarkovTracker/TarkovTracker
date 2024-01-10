<template>
  <div v-show="metadataFetched" id="mapContainer"></div>
  <v-progress-circular v-show="!metadataFetched" indeterminate size="64" color="primary" />
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, defineProps, watch } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./leafletCoordinates";

const props = defineProps({
  map: {
    type: Object,
    required: false,
    default: () => null,
  },
  marks: {
    type: Array,
    required: false,
    default: () => [],
  },
  showExtracts: {
    type: Boolean,
    required: false,
    default: false,
  },
});

// Data fetched from tarkov.dev about the map objects
const mapMetadata = ref(null);
const metadataFetched = ref(false);

// Used to reference the leaflet map object
const map = ref(null);
const svgOverlay = ref(null);

// Watch for changes to the map being passed in, and for the metdata being fetched
watch([
  () => props.map,
  () => mapMetadata.value,
],
  (newMapTrigger) => {
    if (map.value == null) {
      createMap(findMapObject(props.map));
    }
    if (mapMetadata.value) {
      if (map.value == null) {
        createMap(findMapObject(props.map));
      }
      map.value.eachLayer((layer) => {
        layer.remove();
      });
      let mapObject = findMapObject(props.map);
      let bounds = getBounds(mapObject.bounds);
      let maxZoom = Math.max(7, mapObject.maxZoom);
      let layerOptions = {
        maxZoom: maxZoom,
        maxNativeZoom: mapObject.maxZoom,
        extents: [
          {
            height: mapObject.heightRange || [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
            bounds: [bounds],
          }
        ],
        type: 'map-layer',
      };
      if (mapObject?.svgPath) {
        svgOverlay.value = L.imageOverlay(mapObject.svgPath, bounds, layerOptions).addTo(map.value);
        svgOverlay.value.addTo(map.value);

        let svgBounds = svgOverlay.value.getBounds();
        let svgCenter = svgBounds.getCenter();
        map.value.fitBounds(svgBounds);
        //map.value.setView(svgCenter, mapObject.minZoom + 1);
        //debugger
      }
      //map.value.flyTo(centerX, centerY);
    }
  }
);

// Adapted from https://github.com/the-hideout/tarkov-dev/blob/f5bc73dee6a4aebc504c27cc9100c7823c5a50be/src/components/Map.jsx (MIT License)
const createMap = (mapData) => {
  let centerX = (mapData.bounds[0][0] + mapData.bounds[1][0]) / 2;
  let centerY = (mapData.bounds[0][1] + mapData.bounds[1][1]) / 2;
  //let mapCenter = [centerX, centerY];
  let mapCenter = [0, 0];
  let mapZoom = mapData.minZoom + 1;
  const maxZoom = Math.max(7, mapData.maxZoom);
  let scaledBounds = getScaledBounds(mapData.bounds, 1.5);
  map.value = L.map('mapContainer', {
    maxBounds: scaledBounds,
    center: mapCenter,
    zoom: mapZoom,
    minZoom: mapData.minZoom,
    maxZoom: maxZoom,
    zoomSnap: 0.1,
    scrollWheelZoom: true,
    wheelPxPerZoomLevel: 120,
    crs: getCRS(mapData),
    attributionControl: false,
    id: mapData.id,
  });

  //map.value.panTo([centerX, centerY]);

  L.control.coordinates({
    decimals: 2,
    labelTemplateLat: 'z: {y}',
    labelTemplateLng: 'x: {x}',
    enableUserInput: false,
    wrapCoordinate: false,
    position: 'topleft',
    customLabelFcn: (latLng, opts) => {
      return `x: ${latLng.lng.toFixed(2)} z: ${latLng.lat.toFixed(2)}`;
    }
  }).addTo(map.value);
}

// Adapted from https://github.com/the-hideout/tarkov-dev/blob/f5bc73dee6a4aebc504c27cc9100c7823c5a50be/src/components/Map.jsx (MIT License)
function getScaledBounds(bounds, scaleFactor) {
  // Calculate the center point of the bounds
  const centerX = (bounds[0][0] + bounds[1][0]) / 2;
  const centerY = (bounds[0][1] + bounds[1][1]) / 2;

  // Calculate the new width and height
  const width = bounds[1][0] - bounds[0][0];
  const height = bounds[1][1] - bounds[0][1];
  const newWidth = width * scaleFactor;
  const newHeight = height * scaleFactor;

  // Update the coordinates of the two points defining the bounds
  const newBounds = [
    [centerY - newHeight / 2, centerX - newWidth / 2],
    [centerY + newHeight / 2, centerX + newWidth / 2]
  ];

  return newBounds;
}

// Adapted from https://github.com/the-hideout/tarkov-dev/blob/f5bc73dee6a4aebc504c27cc9100c7823c5a50be/src/components/Map.jsx (MIT License)
function getCRS(mapData) {
  let scaleX = 1;
  let scaleY = 1;
  let marginX = 0;
  let marginY = 0;
  if (mapData) {
    if (mapData.transform) {
      scaleX = mapData.transform[0];
      scaleY = mapData.transform[2] * -1;
      marginX = mapData.transform[1];
      marginY = mapData.transform[3];
    }
  }
  return L.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(scaleX, marginX, scaleY, marginY),
    projection: L.extend({}, L.Projection.LonLat, {
      project: latLng => {
        return L.Projection.LonLat.project(applyRotation(latLng, mapData.coordinateRotation));
      },
      unproject: point => {
        return applyRotation(L.Projection.LonLat.unproject(point), mapData.coordinateRotation * -1);
      },
    }),
  });
}

// Adapted from https://github.com/the-hideout/tarkov-dev/blob/f5bc73dee6a4aebc504c27cc9100c7823c5a50be/src/components/Map.jsx (MIT License)
function applyRotation(latLng, rotation) {
  if (!latLng) {
    return L.latLng(0, 0);
  }
  if (!latLng.lng && !latLng.lat) {
    return L.latLng(0, 0);
  }
  if (!rotation) {
    return latLng;
  }

  const angleInRadians = (rotation * Math.PI) / 180;
  const cosAngle = Math.cos(angleInRadians);
  const sinAngle = Math.sin(angleInRadians);

  const { lng: x, lat: y } = latLng;
  const rotatedX = x * cosAngle - y * sinAngle;
  const rotatedY = x * sinAngle + y * cosAngle;
  return L.latLng(rotatedY, rotatedX);
}

// Adapted from https://github.com/the-hideout/tarkov-dev/blob/f5bc73dee6a4aebc504c27cc9100c7823c5a50be/src/components/Map.jsx (MIT License)
function getBounds(bounds) {
  if (!bounds) {
    return undefined;
  }
  return L.latLngBounds([bounds[0][1], bounds[0][0]], [bounds[1][1], bounds[1][0]]);
}

// Function to find the relevant map entry in the metadata file
const findMapObject = (mapId) => {
  let mapNameNormalized = props.map.name.replace(/ /g, "-").toLowerCase();
  return mapMetadata.value.find((map) => map.normalizedName == mapNameNormalized).maps.find((entry) => entry.svgPath != null) || null;
};


onMounted(() => {
  // Fetch the map metadata
  fetch(
    "https://raw.githubusercontent.com/the-hideout/tarkov-dev/main/src/data/maps.json"
  )
    .then((res) => res.json())
    .then((data) => {
      mapMetadata.value = data;
      metadataFetched.value = true;
    });
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
  }
});
</script>

<style scoped>
.leaflet-container {
  background: none !important;
}

#mapContainer {
  width: 100%;
  height: 500px;
}
</style>