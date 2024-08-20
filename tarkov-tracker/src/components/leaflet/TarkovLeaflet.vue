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
import "./leafletLayers";
import { debounce } from "lodash-es";
import { useAppStore } from "@/stores/app.js";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

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
const svgLayer = ref(null);
const tileLayer = ref(null);
const mapContainer = ref(null);

const svgLayers = ref([]);
const tileLayers = ref([]);

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

  // Add the map layer
  let bounds = getBounds(mapData.bounds);
  let baseLayerOptions = {
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

  // Add the layer control
  const layerControl = L.control.groupedLayers(null, null, {
    position: 'topleft',
    collapsed: true,
    groupCheckboxes: true,
    groupsCollapsable: true,
    exclusiveOptionalGroups: [t('maps.levels')],
  }).addTo(leafMap.value);

  // If we have an SVG path, load it
  if (mapData?.svgPath) {
    svgLayer.value = L.imageOverlay(mapData.svgPath, bounds, baseLayerOptions).addTo(leafMap.value);

    let svgBounds = svgLayer.value.getBounds();
    leafMap.value.fitBounds(svgBounds);
    layerControl.addBaseLayer(svgLayer.value, 'Abstract');
  }

  // Set the tilesize (used for the base layer and floor layers)
  const tileSize = mapData.tileSize || 256;

  // If we hae a tile path, load it
  if (mapData.tilePath) {
    tileLayer.value = L.tileLayer(mapData.tilePath || `https://assets.tarkov.dev/maps/${mapData.normalizedName}/{z}/{x}/{y}.png`, {
      tileSize,
      bounds,
      ...baseLayerOptions,
    });
    layerControl.addBaseLayer(tileLayer.value, 'Satellite');
  }

  // Load the other layers
  if (mapData.layers) {
    mapData.layers.forEach((layer) => {
      console.log("Adding layer", layer.name)
      let layerOptions = {
        maxZoom: maxZoom,
        maxNativeZoom: mapData.maxZoom,
        extents: layer.extents,
        type: 'map-layer',
      };

      let layerPath = layer.path || `https://assets.tarkov.dev/maps/${mapData.normalizedName}/${layer.normalizedName}/{z}/{x}/{y}.png`;
      let newLayer = L.tileLayer(layerPath, {
        tileSize,
        bounds,
        ...layerOptions,
      });

      newLayer.addTo(leafMap.value)

      layerControl.addOverlay(newLayer, t(`maps.layers.${layer.name}`), t('maps.levels'));
    });
  }
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
          leafMap.value.fitBounds(svgLayer.value.getBounds());
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

#mapContainer::v-deep .leaflet-control-layers-group-name {
  font-weight: 700;
  margin-bottom: 0.2em;
  margin-left: 3px;
}

#mapContainer::v-deep .leaflet-control-layers-group {
  margin-bottom: 0.5em;
}

#mapContainer::v-deep .leaflet-control-layers-scrollbar {
  overflow-y: scroll;
  padding-right: 10px;
}

#mapContainer::v-deep .leaflet-control-layers-group-label {
  margin-bottom: 2px;
}

#mapContainer::v-deep .leaflet-control-layers-group-selector,
#mapContainer::v-deep .leaflet-control-layers-selector {
  vertical-align: top;
}

#mapContainer::v-deep .leaflet-control-layers-group label:not(.leaflet-control-layers-group-label) {
  text-indent: 15px;
}

#mapContainer::v-deep .leaflet-control-layers-group.group-collapsable.collapsed .leaflet-control-layers-group-collapse,
.leaflet-control-layers-group.group-collapsable:not(.collapsed) .leaflet-control-layers-group-expand,
.leaflet-control-layers-group.group-collapsable.collapsed label:not(.leaflet-control-layers-group-label) {
  display: none;
}

#mapContainer::v-deep .leaflet-control-layers-group-expand-default:before {
  content: "+";
  width: 12px;
  display: inline-block;
  text-align: center;
}

#mapContainer::v-deep .leaflet-control-layers-group-collapse-default:before {
  content: "-";
  width: 12px;
  display: inline-block;
  text-align: center;
}

.leaflet-layer.off-level>.leaflet-tile-container,
div.leaflet-pane.leaflet-overlay-pane>img.off-level {
  opacity: 20%;
}

div.awesome-marker.off-level {
  opacity: 20%;
  z-index: -9999 !important;
}

div.leaflet-pane.leaflet-marker-pane>.off-level {
  opacity: 20%;
  z-index: -9999 !important;
}

div.leaflet-overlay-pane>svg.leaflet-zoom-animated>g>path.off-level {
  stroke-opacity: 20%;
  fill-opacity: 2%;
}

.not-shown {
  display: none;
}
</style>
