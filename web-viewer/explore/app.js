(() => {
  'use strict';

  const PLACES = [
    { id:'haram', name:'Masjid al-Haram', subtitle:'Makkah', lat:21.4225, lon:39.8262, height:1800, heading:0, pitch:-58 },
    { id:'mina', name:'Mina', subtitle:'Hajj tent city', lat:21.4133, lon:39.8933, height:2600, heading:0, pitch:-58 },
    { id:'arafat', name:'ʿArafāt', subtitle:'Plain of ʿArafāt', lat:21.3549, lon:39.9841, height:4200, heading:0, pitch:-55 },
    { id:'muzdalifah', name:'Muzdalifah', subtitle:'Hajj station', lat:21.3890, lon:39.9125, height:3200, heading:0, pitch:-58 },
    { id:'nur', name:'Jabal al-Nūr', subtitle:'Cave of Ḥirāʾ area', lat:21.4575, lon:39.8594, height:2600, heading:0, pitch:-48 },
    { id:'thawr', name:'Jabal Thawr', subtitle:'Cave of Thawr area', lat:21.3773, lon:39.8502, height:3000, heading:0, pitch:-48 },
    { id:'nabawi', name:'Masjid an-Nabawī', subtitle:'Madinah', lat:24.4672, lon:39.6111, height:2200, heading:0, pitch:-58 },
    { id:'aqsa', name:'Al-Aqsa Mosque', subtitle:'Jerusalem', lat:31.7761, lon:35.2358, height:2200, heading:0, pitch:-58 }
  ];

  const MIN_ZOOM_DISTANCE = 40;
  const SAFE_MAX_ZOOM_DISTANCE = 9000000;
  const SAFE_MAX_CAMERA_HEIGHT = 8500000;

  const container = document.getElementById('cesiumContainer');
  const creditContainer = document.getElementById('cesiumCredits');
  const placeButtons = document.getElementById('placeButtons');
  const status = document.getElementById('exploreStatus');
  const activePlace = document.getElementById('activePlace');
  const activeCoordinates = document.getElementById('activeCoordinates');
  const satelliteButton = document.getElementById('satelliteButton');
  const mapButton = document.getElementById('mapButton');

  if (!container || !creditContainer || !placeButtons || !status || !window.Cesium) {
    if (status) status.textContent = 'The 3D globe could not load. Check your connection and reload this page.';
    return;
  }

  const Cesium = window.Cesium;
  let viewer = null;
  let imageryLayer = null;
  let activeId = 'haram';
  let imageryMode = 'satellite';
  let zoomGuardActive = false;
  let zoomLimitNoticeShown = false;

  function formatCoordinate(value, positive, negative) {
    const direction = value >= 0 ? positive : negative;
    return `${Math.abs(value).toFixed(4)}° ${direction}`;
  }

  function placeById(id) {
    return PLACES.find(place => place.id === id) || PLACES[0];
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function setActiveButton(id) {
    placeButtons.querySelectorAll('.place-button').forEach(button => {
      button.setAttribute('aria-pressed', button.dataset.placeId === id ? 'true' : 'false');
    });
  }

  function updateUrl(place) {
    const url = new URL(window.location.href);
    url.searchParams.set('place', place.id);
    history.replaceState(null, '', url);
  }

  function flyToPlace(place, instant = false) {
    activeId = place.id;
    activePlace.textContent = `${place.name} · ${place.subtitle}`;
    activeCoordinates.textContent = `${formatCoordinate(place.lat, 'N', 'S')} · ${formatCoordinate(place.lon, 'E', 'W')}`;
    setActiveButton(place.id);
    updateUrl(place);
    zoomLimitNoticeShown = false;

    const destination = Cesium.Cartesian3.fromDegrees(place.lon, place.lat, place.height);
    const orientation = {
      heading: Cesium.Math.toRadians(place.heading || 0),
      pitch: Cesium.Math.toRadians(place.pitch || -55),
      roll: 0
    };

    if (instant) {
      viewer.camera.setView({ destination, orientation });
    } else {
      viewer.camera.flyTo({ destination, orientation, duration:1.8 });
    }

    setStatus(`Viewing ${place.name}. Drag to orbit, scroll to zoom, and choose another location at any time.`);
  }

  async function makeSatelliteProvider() {
    return Cesium.ArcGisMapServerImageryProvider.fromUrl(
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      { enablePickFeatures:false }
    );
  }

  function makeMapProvider() {
    return new Cesium.OpenStreetMapImageryProvider({
      url:'https://tile.openstreetmap.org/',
      credit:'© OpenStreetMap contributors'
    });
  }

  async function switchImagery(mode) {
    imageryMode = mode;
    satelliteButton.className = mode === 'satellite' ? 'primary' : 'secondary';
    mapButton.className = mode === 'map' ? 'primary' : 'secondary';

    try {
      const provider = mode === 'satellite' ? await makeSatelliteProvider() : makeMapProvider();
      if (imageryLayer) viewer.imageryLayers.remove(imageryLayer, true);
      imageryLayer = viewer.imageryLayers.addImageryProvider(provider);
      setStatus(`${mode === 'satellite' ? 'Satellite imagery' : 'Map view'} loaded for ${placeById(activeId).name}.`);
    } catch (error) {
      console.error('Imagery switch failed:', error);
      if (mode !== 'map') {
        setStatus('Satellite imagery could not load, switching to map view…');
        switchImagery('map');
      } else {
        setStatus('Map imagery could not load. The globe remains available without a basemap.');
      }
    }
  }

  function addPlaceMarkers() {
    PLACES.forEach(place => {
      viewer.entities.add({
        id:`holy-place-${place.id}`,
        position:Cesium.Cartesian3.fromDegrees(place.lon, place.lat, 80),
        point:{
          pixelSize:10,
          color:Cesium.Color.fromCssColorString('#d8b560'),
          outlineColor:Cesium.Color.fromCssColorString('#071b15'),
          outlineWidth:3,
          disableDepthTestDistance:Number.POSITIVE_INFINITY
        },
        label:{
          text:place.name,
          font:'700 14px system-ui',
          fillColor:Cesium.Color.WHITE,
          outlineColor:Cesium.Color.BLACK,
          outlineWidth:4,
          style:Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset:new Cesium.Cartesian2(0, -22),
          verticalOrigin:Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance:Number.POSITIVE_INFINITY,
          distanceDisplayCondition:new Cesium.DistanceDisplayCondition(0, 250000)
        }
      });
    });
  }

  function buildPlaceButtons() {
    PLACES.forEach(place => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'place-button';
      button.dataset.placeId = place.id;
      button.setAttribute('aria-pressed', 'false');
      button.textContent = place.name;
      button.title = place.subtitle;
      button.addEventListener('click', () => flyToPlace(place));
      placeButtons.appendChild(button);
    });
  }

  function installMapClick() {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(movement => {
      const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
      if (!cartesian) return;
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lon = Cesium.Math.toDegrees(cartographic.longitude);
      activeCoordinates.textContent = `${formatCoordinate(lat, 'N', 'S')} · ${formatCoordinate(lon, 'E', 'W')}`;
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  function installSafeZoomGuard() {
    const controller = viewer.scene.screenSpaceCameraController;
    controller.enableCollisionDetection = true;
    controller.minimumZoomDistance = MIN_ZOOM_DISTANCE;
    controller.maximumZoomDistance = SAFE_MAX_ZOOM_DISTANCE;

    viewer.scene.preUpdate.addEventListener(() => {
      if (zoomGuardActive) return;

      const camera = viewer.camera;
      const position = camera.positionCartographic;
      if (!position) return;

      const valuesAreFinite = Number.isFinite(position.longitude) &&
        Number.isFinite(position.latitude) &&
        Number.isFinite(position.height);

      if (!valuesAreFinite) {
        const place = placeById(activeId);
        zoomGuardActive = true;
        camera.setView({
          destination:Cesium.Cartesian3.fromDegrees(place.lon, place.lat, 1500000),
          orientation:{ heading:0, pitch:Cesium.Math.toRadians(-85), roll:0 }
        });
        zoomGuardActive = false;
        setStatus('The globe camera reached an invalid position and was safely returned to the current region.');
        return;
      }

      if (position.height <= SAFE_MAX_CAMERA_HEIGHT) {
        zoomLimitNoticeShown = false;
        return;
      }

      zoomGuardActive = true;
      const heading = Number.isFinite(camera.heading) ? camera.heading : 0;
      const pitch = Number.isFinite(camera.pitch) ? camera.pitch : Cesium.Math.toRadians(-90);
      const roll = Number.isFinite(camera.roll) ? camera.roll : 0;

      camera.setView({
        destination:Cesium.Cartesian3.fromRadians(
          position.longitude,
          position.latitude,
          SAFE_MAX_CAMERA_HEIGHT
        ),
        orientation:{ heading, pitch, roll }
      });
      zoomGuardActive = false;

      if (!zoomLimitNoticeShown) {
        zoomLimitNoticeShown = true;
        setStatus('Maximum safe world-view distance reached. Zoom back in to continue exploring the holy places.');
      }
    });
  }

  async function start() {
    buildPlaceButtons();

    viewer = new Cesium.Viewer(container, {
      timeline:false,
      animation:false,
      baseLayerPicker:false,
      geocoder:false,
      homeButton:false,
      sceneModePicker:false,
      navigationHelpButton:false,
      fullscreenButton:false,
      vrButton:false,
      selectionIndicator:false,
      infoBox:false,
      baseLayer:false,
      creditContainer,
      requestRenderMode:true,
      maximumRenderTimeChange:Infinity
    });

    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0b3d2e');
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.fog.enabled = true;

    // Tor Browser and some hardened Firefox configurations block WebGL depth-buffer
    // readback. The Explorer does not need depth picking, so keep Cesium out of
    // that path and place our markers slightly above the ellipsoid instead of
    // clamping them to terrain.
    viewer.scene.useDepthPicking = false;
    viewer.scene.pickTranslucentDepth = false;
    viewer.scene.globe.depthTestAgainstTerrain = false;

    installSafeZoomGuard();

    addPlaceMarkers();
    installMapClick();

    satelliteButton.addEventListener('click', () => switchImagery('satellite'));
    mapButton.addEventListener('click', () => switchImagery('map'));

    const requested = new URL(window.location.href).searchParams.get('place');
    const initialPlace = placeById(requested || 'haram');
    await switchImagery('satellite');
    flyToPlace(initialPlace, true);
    setStatus(`Holy Places Explorer ready at ${initialPlace.name}.`);
  }

  start().catch(error => {
    console.error(error);
    setStatus('The Holy Places Explorer could not start. Check your connection and reload this page.');
  });
})();
