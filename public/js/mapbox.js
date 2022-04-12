const locations = JSON.parse(document.getElementById('map').dataset.locations);

// console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1Ijoic2FuemFpa2MiLCJhIjoiY2wxdmh2enZjMG1qNzNmbzVoNHd1eHdvNCJ9.iJyD12jg4Mb7rHM8zK5aaw';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/sanzaikc/cl1vinp0a001y15o90y292tkf',
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Creating Custom Marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Adding Custom  Marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(
      `
    <p>Day ${loc.day}: ${loc.description} </p>
    `
    )
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, { padding: 200 });
