// We import the CSS which is extracted to its own file by esbuild.
// Remove this line if you add a your own CSS build pipeline (e.g postcss).
import "../css/app.css"

// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from "phoenix"
import { LiveSocket } from "phoenix_live_view"
import topbar from "../vendor/topbar"

/**
 * Describes a FoodTruck
 */
class FoodTruck {
    constructor(arg) {
        /** @type {string} */
        this.applicant = arg["applicant"]
        /** @type {number} */
        this.latitude = arg["latitude"]
        /** @type {number} */
        this.longitude = arg["longitude"]
        /** @type {string} */
        this.food_items = arg["fooditems"]
        /** @type {string} */
        this.schedule = arg["schedule"]
        /** @type {string} */
        this.address = arg["address"]
    }
}

/**
 * Describes a latitude and longitude
 */
class LatLng {
    constructor(arg) {
        /** @type {number} */
        this.lat = arg["lat"]
        /** @type {number} */
        this.lng = arg["lng"]
    }
}

let currWindow = false

let Hooks = {}
Hooks.Map = {
    /**
     * Returns list of FoodTrucks
     * @returns {FoodTruck[]}
     */
    foodTrucks() { return JSON.parse(this.el.dataset.food_trucks).map((foodTruck) => { return new FoodTruck(foodTruck) }) },
    /**
     * Initializes the Google Map
     */
    initMap() {
        const myLatLng = new LatLng({ lat: 37.7749, lng: -122.4194 })
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 12,
            center: myLatLng,
        })
        this.placeFoodTruckMarkers(map)
    },
    /**
     * Takes in a Google Map and places food truck markers on it
     * @param {*} map 
     */
    placeFoodTruckMarkers(map) {
        this.foodTrucks().forEach(
            /**
             * For each FoodTruck place a map marker
             * @param {FoodTruck} foodTruck 
             */
            (foodTruck) => {
                const contentString =
                    `${foodTruck.applicant}</br></br>
                    Address</br>${foodTruck.address}, San Francisco, CA</br></br>
                    <a href=${foodTruck.schedule}>Schedule</a></br></br>
                    Food</br>${foodTruck.food_items}`
                const infowindow = new google.maps.InfoWindow({
                    content: contentString,
                })
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(foodTruck.latitude), lng: parseFloat(foodTruck.longitude) },
                    map,
                    icon: "/images/map_pin_red.png"
                })
                google.maps.event.addListener(map, "click", function () {
                    infowindow.close();
                    global = "closed"
                });
                google.maps.event.addListener(marker, 'click', function () {
                    if (currWindow) {
                        currWindow.close();
                    }
                    currWindow = infowindow;
                    infowindow.open(map, marker);
                });
            })
    },
    /**
     * Built in mounted method used to initilize the map
     * Docs: https://hexdocs.pm/phoenix_live_view/js-interop.html#client-hooks-via-phx-hook
     */
    mounted() {
        window.initMap = this.initMap()
    },
    /**
     * Built in updated method used when updating map
     * Docs: https://hexdocs.pm/phoenix_live_view/js-interop.html#client-hooks-via-phx-hook
     */
    updated() {
        this.initMap()
    }
}

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, { hooks: Hooks, params: { _csrf_token: csrfToken } })

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" })
window.addEventListener("phx:page-loading-start", info => topbar.show())
window.addEventListener("phx:page-loading-stop", info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket

