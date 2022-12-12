mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: campground.geometry.coordinates,
    zoom: 6
});
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<p>${campground.name}<p>`
            )
    )
    .addTo(map)

map.addControl(new mapboxgl.NavigationControl());
