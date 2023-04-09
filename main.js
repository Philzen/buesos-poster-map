fetch('/data/poster_buesos.geojson', {
// fetch('https://map.de/query/xxx', {
    method: 'GET'
})
.then((response) => {
    return response.json()
})
.then((data) => {
    addData(data);
})
.catch(function (error) {
    console.log(error);
})


const map = L.map('map').setView([54.7836, 9.4321], 14)


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)


let geocoder = L.Control.Geocoder.nominatim()

if (typeof URLSearchParams !== 'undefined' && location.search) {
    // parse /?geocoder=nominatim from URL
    let params = new URLSearchParams(location.search)
    let geocoderString = params.get('geocoder')

    if (geocoderString && L.Control.Geocoder[geocoderString]) {
        console.log('Using geocoder', geocoderString)
        geocoder = L.Control.Geocoder[geocoderString]()
    } else if (geocoderString) {
        console.warn('Unsupported geocoder', geocoderString)
    }
}

const osmGeocoder = new L.Control.geocoder({
    query: 'Flensburg',
    position: 'topright',
    placeholder: 'Adresse oder Ort',
    defaultMarkGeocode: false
}).addTo(map)

osmGeocoder.on('markgeocode', e => {
    const bounds = L.latLngBounds(e.geocode.bbox._southWest, e.geocode.bbox._northEast)
    map.fitBounds(bounds)
})


function onMapClick(evt) {
    const latLngs = [evt.target.getLatLng()]
    const markerBounds = L.latLngBounds(latLngs)
    map.fitBounds(markerBounds)

    const imageSource = evt.target.feature.properties.image
    const imageTitle = evt.target.feature.properties.name

    const imageElement = document.createElement('img')
    const titleElement = document.createElement('p')
    const titleSource = document.createTextNode(imageTitle)

    titleElement.appendChild(titleSource)
    titleElement.classList.add('text-sm', 'open-sans', 'px-3', 'pb-3')

    imageElement.classList.add('p-3')
    imageElement.setAttribute('src', imageSource)
    imageElement.setAttribute('target', '_blank')
 
    document.getElementById('details').innerHTML = ''
    document.getElementById('details').appendChild(imageElement)
    document.getElementById('details').appendChild(titleElement)

    evt.preventDefault
}


function onEachFeature(feature, layer) {
    const label = `Ort ${feature.properties.name}`

    layer.on('click', function(evt) {
        onMapClick(evt)
    })

    layer.bindTooltip(label, {
        permanent: false,
        direction: 'top'
    }).openTooltip()
}


function addData(data) {
    const layer = L.geoJson(data, {
        onEachFeature: onEachFeature
    }).addTo(map)

    map.fitBounds(layer.getBounds(), {padding: [0, 0, 0, 0]})
}
