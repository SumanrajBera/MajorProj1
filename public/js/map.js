mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: longLang, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});

const marker1 = new mapboxgl.Marker({ color: "#fe424d" })
    .setLngLat(longLang)
    .setPopup(new mapboxgl.Popup({offset: 25}).setHTML(`<h5>${title}</h5><p>Address Provided After booking</p>`).setMaxWidth("300px"))
    .addTo(map);