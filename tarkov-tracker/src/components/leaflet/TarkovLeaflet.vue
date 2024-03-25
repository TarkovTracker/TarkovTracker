<template>
  <div class="map-resizable">
    <div id="mapContainer" ref="mapContainer">
      <v-progress-circular v-show="!metadataFetched" indeterminate size="64" color="primary" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, defineProps, watch } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./leafletCoordinates";
import { debounce } from "lodash-es";
import { useAppStore } from "@/stores/app.js";
import { computed } from "vue";

const appStore = useAppStore();

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
const leafMap = ref(null);
const svgOverlay = ref(null);
const mapContainer = ref(null);

// Watch for changes to the map being passed in, and for the metdata being fetched
watch([
  () => props.map,
  () => mapMetadata.value,
],
  (newMapTrigger, oldMapTrigger) => {
    // Don't load the map until we have the metadata
    if (!metadataFetched.value) {
      return;
    }

    // Only proceed if we have the metadata for the maps
    if (mapMetadata.value) {
      // Find the relevant map from the map metadata 
      let mapObject = findMapObject(props.map);

      // Create the map object and load its layer properties
      createMap(mapObject);
    }
  }
);

// Adapted from https://github.com/the-hideout/tarkov-dev/blob/f5bc73dee6a4aebc504c27cc9100c7823c5a50be/src/components/Map.jsx (MIT License)
const createMap = (mapData) => {
  // If the leafMap already exists, remove it so we can start fresh
  if (leafMap.value) {
    leafMap.value.remove();
  }

  let centerX = (mapData.bounds[0][0] + mapData.bounds[1][0]) / 2;
  let centerY = (mapData.bounds[0][1] + mapData.bounds[1][1]) / 2;
  let mapCenter = [centerX, centerY];
  let mapZoom = mapData.minZoom + 1;
  let maxZoom = Math.max(7, mapData.maxZoom);
  let scaledBounds = getScaledBounds(mapData.bounds, 1.5);
  let crsData = getCRS(mapData);
  leafMap.value = L.map('mapContainer', {
    maxBounds: scaledBounds,
    center: mapCenter,
    zoom: mapZoom,
    minZoom: mapData.minZoom - 1,
    maxZoom: maxZoom,
    zoomSnap: 0,
    scrollWheelZoom: true,
    wheelPxPerZoomLevel: 60,
    crs: crsData,
    attributionControl: false,
  });

  // Add the map layer
  let bounds = getBounds(mapData.bounds);
  let layerOptions = {
    maxZoom: maxZoom,
    maxNativeZoom: mapData.maxZoom,
    extents: [
      {
        height: mapData.heightRange || [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
        bounds: [bounds],
      }
    ],
    type: 'map-layer',
  };

  // Update the base map properties
  leafMap.value.setMaxZoom(maxZoom);

  // If we have an SVG path, load it
  if (mapData?.svgPath) {
    svgOverlay.value = L.imageOverlay(mapData.svgPath, bounds, layerOptions).addTo(leafMap.value);
    //svgOverlay.value.addTo(leafMap.value);

    let svgBounds = svgOverlay.value.getBounds();
    leafMap.value.fitBounds(svgBounds);
  }

  // Add the coordinates control
  L.control.coordinates({
    decimals: 2,
    labelTemplateLat: 'z: {y}',
    labelTemplateLng: 'x: {x}',
    enableUserInput: false,
    wrapCoordinate: false,
    position: 'topright',
    customLabelFcn: (latLng, opts) => {
      return `X: <span class="value">${latLng.lng.toFixed(2)}</span> Z: <span class="value">${latLng.lat.toFixed(2)}</span>`;
    }
  }).addTo(leafMap.value);
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

const loadMap = (mapData) => {
  return
}


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

  document.querySelector('#mapContainer').addEventListener('mousedown', function (event) {
    // Check if the mousedown event is near the edge of the element.
    // This is a simplified check; you might need a more sophisticated method.
    const elementRect = this.getBoundingClientRect();
    const isNearEdge = event.clientX > elementRect.right - 15 && event.clientY > elementRect.bottom - 15;
    if (isNearEdge) {
      // Stop the map from dragging and zooming
      if (leafMap.value) {
        leafMap.value.dragging.disable();
        leafMap.value.scrollWheelZoom.disable();
      }


      // Remove the event listener when the mouse is released anywhere in the document.
      document.addEventListener('mouseup', function () {
        // Re-enable dragging
        if (leafMap.value) {
          leafMap.value.dragging.enable();
          leafMap.value.scrollWheelZoom.enable();
          // Recenter the map
          leafMap.value.invalidateSize();
          leafMap.value.fitBounds(svgOverlay.value.getBounds());
        }
      }, { once: true });
    }
  });

  // Add a mouseover event listener to the map container
  document.querySelector('#mapContainer').addEventListener('mouseover', function (event) {
    // Show the coordinates control
    document.querySelector('.leaflet-control-coordinates').style.display = 'block';
  });

  // Add a mouseout event listener to the map container
  document.querySelector('#mapContainer').addEventListener('mouseout', function (event) {
    // Hide the coordinates control
    document.querySelector('.leaflet-control-coordinates').style.display = 'none';
  });

  // Add a resize observer to the map container and save the vertical height when it changes
  new ResizeObserver((entry) => {
    // If this is the first load of the height, don't update the store
    if (firstHeight.value) {
      firstHeight.value = false;
    } else {
      updateMapHeight(entry);
    }
  }).observe(document.querySelector('#mapContainer'));
});

// Helpers to allow the map size to be maintained in local storage between sessions
const firstHeight = ref(true);
const updateMapHeight = debounce((newVal) => {
  appStore.mapHeight = newVal[0].contentRect.height;
}, 1000);
const mapHeightPx = computed(() => appStore.mapHeight + 'px');

onBeforeUnmount(() => {
  if (leafMap.value) {
    leafMap.value.remove();
  }
});
</script>

<style scoped>
.leaflet-container {
  background: none !important;
}

#mapContainer {
  width: 100%;
  height: v-bind(mapHeightPx);
  min-height: 500px;
  resize: vertical;
}

#mapContainer::v-deep .leaflet-control-coordinates .uiHidden {
  display: none;
}

#mapContainer::v-deep .leaflet-control-coordinates {
  color: #FFFFFF;
  font-weight: bold;
  background-color: rgba(var(--v-theme-accent), 1);
  cursor: pointer;
  padding: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
}
</style>
