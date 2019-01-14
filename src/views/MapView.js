import AutoloadGoogleMap from "./../components/Map"
// export default AutoloadGoogleMap;
import React from "react";
import { observer, inject } from "mobx-react";
// import { resolveInjectedProps, DistanceSlider, Platform, Box, Text } from "../../../RhsComponents";
//  import FloatingIcon from "./FloatingIcon";
// import TrackingLocation from "./TrackingLocation";
// import SpeedView from "./SpeedView";
import {
    VEHICLE_NUMBER,
    getHistoryStartTime,
    subscribeVehicle,
    unsubscribeVehicle,
    getIMEI,
    getVehicle,
    isSubscribed,
    getStops,
    getLocation,
    MAP_TYPES,
    ACTIONS,
    getCoveredStops,
    getSpeedLatencyFormat
} from "./../manaze/VehicleUtilities";
import {
    getVehicleMarker,
    getPickupMarker,
    getGeneralStopMarkers,
    getDeliveryMarker,
    addPolyline,
    mergeHistoryPolyline,
    updateGeneralMarkers
} from "./../manaze/MapUtilitiy";
// import AutoloadGoogleMap from "./AutoloadGoogleMap";

// @inject((store, props) =>
//     resolveInjectedProps(store, props, ["gpsStore", "viewStore", "trackScreen", "isScrollEnabled"])
// )
@observer
export default class TrackView extends React.Component {
    constructor(props) {
        super(props);
        this.uid = new Date().getTime();
    }

    getVehicleInfo = () => {
        let { vehicle } = this.props;
        let data= {
                "_id": "5c29e0fc1ed0918169ef5909",
                "lr_no": "2561",
                "pickup": {
                    "_id": "5c29e0fd860ebd6e5e796df7",
                    "latitude": 29.130244,
                    "longitude": 75.77279410000006,
                    "description": "Industrial Area, O.P. Jindal Marg, Industrial Area, Hisar, Haryana 125005, India",
                    "address_levels": {
                        "country": "Industrial Area, O.P. Jindal Marg, Industrial Area, Hisar, Haryana 125005, India"
                    },
                    "address": "Industrial Area, O.P. Jindal Marg, Industrial Area, Hisar, Haryana 125005, India"
                },
                "delivery": {
                    "_id": "5c29e0fd860ebd6e5e796df8",
                    "latitude": 17.63475,
                    "longitude": 78.65027780000003,
                    "description": "17°38'05. 78°39'01.0\"E, 1, Kothaguda, Hyderabad, Telangana 500084, India",
                    "address_levels": {
                        "country": "17°38'05. 78°39'01.0\"E, 1, Kothaguda, Hyderabad, Telangana 500084, India"
                    },
                    "address": "17°38'05. 78°39'01.0\"E, 1, Kothaguda, Hyderabad, Telangana 500084, India"
                },
                "driver": "RAJKUMAR",
                "status": "Active",
                "vehicle": {
                    "_id": "55cceee8f06223932cb746c3",
                    "number": "HR61A0418",
                    "device": {
                        "_id": "582af815faba0e6ab7dc5777",
                        "imei": "358735070271548"
                    }
                },
                "customer": {
                    "_id": "57edf7f413d3f9de3275678d",
                    "name": "JSHL",
                    "email": "subhrendu.sengupta@jshl.in,parveen.verma@jshl.in,anil.chauhan@jshl.in,lokesh.meena@jshl.in,mayank.kumar@jshl.in,mayank.kumar@jshl.in,tracking.mdc@jshl.in,JINDALHISAR@autoload.com"
                },
                "plant_in": "2018-12-28T09:12:00.000Z",
                "start_time": "2018-12-31T09:27:25.650Z",
                "plant_type": "cr",
                "invoice_date": "2018-12-31T08:25:44.000Z",
                "transporter": {
                    "_id": "596dab900b4cf6107972d50c",
                    "name": "Zinka Logistics Solutions Pvt Ltd"
                },
                "driver_mobile": "9813823350",
                "ext_delivery_days": 5,
                "total_distance": 1729,
                "coveredDistance": 0,
                "reached_status": "Delay",
                "pendingDistance": 1729,
                "lastSignalTime": "2018-12-31T09:27:25.661Z",
                "lastSignalReceived": {
                    "latitude": 29.130244,
                    "longitude": 75.77279410000006,
                    "formattedAddress": "Vishal Nagar Industrial Area, Hisar 125005, India"
                }
            }

        return vehicle || getVehicle(data);
    };

    // componentWillMount() {
    //     const { trackScreen, gpsStore } = this.props;
    //     trackScreen && trackScreen("TrackVehicleMap");
    //     subscribeVehicle({ gpsStore, data: this.getVehicleInfo(), uid: this.uid });
    // }
    //
    // componentWillUnmount() {
    //     this._unmounted = true;
    //     const { gpsStore } = this.props;
    //     unsubscribeVehicle({ gpsStore, data: this.getVehicleInfo(), uid: this.uid });
    // }

    render() {
        let { gpsStore } = this.props;
        let data= {
            "_id": "5c29e0fc1ed0918169ef5909",
            "lr_no": "2561",
            "pickup": {
                "_id": "5c29e0fd860ebd6e5e796df7",
                "latitude": 29.130244,
                "longitude": 75.77279410000006,
                "description": "Industrial Area, O.P. Jindal Marg, Industrial Area, Hisar, Haryana 125005, India",
                "address_levels": {
                    "country": "Industrial Area, O.P. Jindal Marg, Industrial Area, Hisar, Haryana 125005, India"
                },
                "address": "Industrial Area, O.P. Jindal Marg, Industrial Area, Hisar, Haryana 125005, India"
            },
            "delivery": {
                "_id": "5c29e0fd860ebd6e5e796df8",
                "latitude": 17.63475,
                "longitude": 78.65027780000003,
                "description": "17°38'05. 78°39'01.0\"E, 1, Kothaguda, Hyderabad, Telangana 500084, India",
                "address_levels": {
                    "country": "17°38'05. 78°39'01.0\"E, 1, Kothaguda, Hyderabad, Telangana 500084, India"
                },
                "address": "17°38'05. 78°39'01.0\"E, 1, Kothaguda, Hyderabad, Telangana 500084, India"
            },
            "driver": "RAJKUMAR",
            "status": "Active",
            "vehicle": {
                "_id": "55cceee8f06223932cb746c3",
                "number": "HR61A0418",
                "device": {
                    "_id": "582af815faba0e6ab7dc5777",
                    "imei": "358735070271548"
                }
            },
            "customer": {
                "_id": "57edf7f413d3f9de3275678d",
                "name": "JSHL",
                "email": "subhrendu.sengupta@jshl.in,parveen.verma@jshl.in,anil.chauhan@jshl.in,lokesh.meena@jshl.in,mayank.kumar@jshl.in,mayank.kumar@jshl.in,tracking.mdc@jshl.in,JINDALHISAR@autoload.com"
            },
            "plant_in": "2018-12-28T09:12:00.000Z",
            "start_time": "2018-12-31T09:27:25.650Z",
            "plant_type": "cr",
            "invoice_date": "2018-12-31T08:25:44.000Z",
            "transporter": {
                "_id": "596dab900b4cf6107972d50c",
                "name": "Zinka Logistics Solutions Pvt Ltd"
            },
            "driver_mobile": "9813823350",
            "ext_delivery_days": 5,
            "total_distance": 1729,
            "coveredDistance": 0,
            "reached_status": "Delay",
            "pendingDistance": 1729,
            "lastSignalTime": "2018-12-31T09:27:25.661Z",
            "lastSignalReceived": {
                "latitude": 29.130244,
                "longitude": 75.77279410000006,
                "formattedAddress": "Vishal Nagar Industrial Area, Hisar 125005, India"
            }
        }
        let vehicleInfo = this.getVehicleInfo();
        let renderProps = { data: vehicleInfo, gpsStore };
        let currentLocation = getLocation({ gpsStore, data: vehicleInfo });
        currentLocation={latitude:17.63475,longitude:78.65027780000003,description:"17°38'05. 78°39'01.0\\\"E, 1, Kothaguda, Hyderabad, Telangana 500084, India"}
        if (!currentLocation) {
            /*
             *  Tracking vehicle your location is shown until vehicle is not subscribed and interaction manager work
             *  not completed as subscription is done after interaction manager done - Rohit Garg - 27 June, 2018
             * */
            // return <TrackingLocation subscribed={isSubscribed(renderProps)} />;
        }
        // let coveredStops = getCoveredStops(renderProps) || [];
         let coveredStops = [];
        return (
            <TrackVehicleMap
                data={data}
                coveredStops={coveredStops}
                currentLocation={currentLocation}
                vehicle={vehicleInfo}
            />
        );
    }
}

// @inject((store, props) => resolveInjectedProps(store, props, ["gpsStore", "viewStore", "isScrollEnabled"]))
@observer
class TrackVehicleMap extends React.Component {
    componentWillMount() {
        // console.log("TrackVehicleMap componentWillMount>>>>"+JSON.stringify(this.props))
        this.state = { openInfoWindow: false };
        this.polyline = [];
        const { data, coveredStops } = this.props;
        this.coveredStops = this.getCoveredStopIds(coveredStops);
        this.populateStopMarkers(data);
         this.setHistoryData();
    }

    getCoveredStopIds = coveredStops => {
        if (!coveredStops) {
            return [];
        }
        return coveredStops.map(stop => stop._id);
    };

    setHistoryData = () => {
        let { gpsStore, data, vehicle } = this.props;
        let startTime = getHistoryStartTime(data);
        if (startTime && !this._unmounted) {
            setTimeout(_ => {
                if (!this._unmounted && gpsStore) {
                    gpsStore.socket.emit(
                        "historyData",
                        {
                            imei: getIMEI(vehicle),
                            startTime,
                            endTime: new Date()
                        },
                        (err, gpsData) => {
                            let historyData = gpsData && gpsData.historyData;
                            if (!this._unmounted) {
                                mergeHistoryPolyline(historyData, this.polyline);
                                this.setState({});
                            }
                        }
                    );
                }
            }, 500);
        }
    };

    populateStopMarkers = data => {
        let { pickup, delivery, trip_detail } = data;
        if (trip_detail) {
            let stops = getStops(data);
            let stopsLength = stops && stops.length;
            if (stopsLength) {
                this.stops = stops;
                this.pickupMarker = getPickupMarker(stops[0]);
                this.deliveryMarker = getDeliveryMarker(stops[stopsLength - 1]);
                this.generalMarkers = getGeneralStopMarkers(stops, this.pickupMarker, this.deliveryMarker, this.coveredStops);
            }
        } else {
            console.log("else called")
            if (pickup) {
                this.pickupMarker = getPickupMarker({
                    ...pickup,
                    lat: pickup.latitude,
                    long: pickup.longitude,
                    stop: pickup.description
                });
            }
            if (delivery) {
                this.deliveryMarker = getDeliveryMarker({
                    ...delivery,
                    lat: delivery.latitude,
                    long: delivery.longitude,
                    stop: delivery.description
                });
            }
        }
        console.log("generate marked successfully")
    };

    componentWillReceiveProps(nextProps) {
        let { coveredStops } = nextProps;
        let { coveredStops: prevCoveredStops } = this.props;
        if (coveredStops && (!prevCoveredStops || prevCoveredStops.length !== coveredStops.length)) {
            this.coveredStops = this.getCoveredStopIds(coveredStops);
            this.generalMarkers = getGeneralStopMarkers(
                this.stops,
                this.pickupMarker,
                this.deliveryMarker,
                this.coveredStops
            );
        }
    }

    getInfoWindow = (vehicle, location = {}) => {
        if (!vehicle || !location) {
            return;
        }
        let { latitude, longitude } = location;
        let infoWindow = `${vehicle[VEHICLE_NUMBER] || "-"} , ${location.speed || 0} km/h`;
        let speedLatencyFormat = getSpeedLatencyFormat(location);
        if (speedLatencyFormat) {
            infoWindow += `<br />${speedLatencyFormat}`;
        }
        if (latitude && longitude) {
            fetch(
                `http://getgoogleloc.applane.com/googleResponse?lat=${latitude}&lng=${longitude}&token=ba49c240956bdb84d5c15f7afe7c6aba1cc68701&type=address`
            )
                .then(result => result.json())
                .then(results => {
                    results = results && results.results;
                    let { formatted_address } = results ? results[0] : {};
                    if (formatted_address) {
                        infoWindow += `<br />${formatted_address}`;
                    } else {
                        infoWindow += `<br />Latitude: ${latitude}`;
                        infoWindow += `<br />Longitude: ${longitude}`;
                    }
                    this.setState({ infoWindow });
                }).catch(err=>{
                // do nothing
            });
        }
    };

    getMarkersToShow = () => {
        let { viewStore, currentLocation, vehicle } = this.props;
        let markers = [];
        let { openInfoWindow, infoWindow } = this.state;
        if (!infoWindow && openInfoWindow) {
            this.getInfoWindow(vehicle, currentLocation);
        }
        markers.push(
            getVehicleMarker({
                data: vehicle,
                title: "",
                location: currentLocation,
                infoWindow: infoWindow,
                onMarkerClick: () => {
                    if (openInfoWindow !== true) {
                        this.setState({ openInfoWindow: true });
                    }
                },
                onCloseInfoWindow: () => {
                    this.setState({ openInfoWindow: false, infoWindow: void 0 });
                }
            })
        );
        let coveredStop = currentLocation.coveredStop;
        let coveredStopId = coveredStop && coveredStop._id;
        if (coveredStopId && !(this.coveredStops.indexOf(coveredStopId) > -1)) {
            this.coveredStops.push(coveredStopId);
            updateGeneralMarkers(this.generalMarkers, coveredStopId);
        }
        addPolyline(currentLocation, this.polyline);
        let selectedAction = viewStore && viewStore.get("selectedAction");
        let stopMarkersInBound = selectedAction !== ACTIONS.ONLY_VEHICLE;
        let pickupMarker = this.pickupMarker;
        let deliveryMarker = this.deliveryMarker;
        let generalMarkers = this.generalMarkers;
        pickupMarker &&
        markers.push({
            ...pickupMarker,
            inBounds: stopMarkersInBound
        });
        deliveryMarker &&
        markers.push({
            ...deliveryMarker,
            inBounds: stopMarkersInBound
        });
        generalMarkers &&
        generalMarkers.forEach(generalMarker => {
            markers.push({ ...generalMarker, inBounds: stopMarkersInBound });
        });
        return markers;
    };

    getFitInBound = () => {
        let fitInBound = this.fitInBound;
        if (fitInBound) {
            this.fitInBound = false;
        }
        return fitInBound;
    };

    render() {
        let { viewStore, isScrollEnabled, data = {}, currentLocation } = this.props;
        let { trip_detail } = data;
        let mapType = viewStore && viewStore.get("mapType") || MAP_TYPES.STANDARD;
        let markersToShow = this.getMarkersToShow();
        console.log("markersToShow>>>>>"+JSON.stringify(markersToShow))
        let mapComponent = [];
        // let distanceSliderHeight = viewStore && viewStore.get("distanceSliderHeight");
        // mapComponent.push(
        //     <FloatingIcon
        //         onClick={action => {
        //             if (action !== ACTIONS.SHOW_HYBRID) {
        //                 this.fitInBound = true;
        //             }
        //         }}
        //     />
        // );
        mapComponent.push(
            <AutoloadGoogleMap
                mapLayoutStyle={{ bottom: 0 }}
                mapType={mapType}
                minZoom={5}
                maxZoom={17}
                scrollEnabled={isScrollEnabled ? isScrollEnabled() : true}
                rotateEnabled={false}
                markers={markersToShow}
                fitInBound={this.getFitInBound()}
                polyline={this.polyline}
            />
        );
        // if (trip_detail) {
        //     mapComponent.push(
        //         <MapDistanceSlider stops={this.stops} coveredStops={[...this.coveredStops]} currentLocation={currentLocation} />
        //     );
        // } else {
        //     mapComponent.push(<SpeedView currentLocation={currentLocation} destination={this.deliveryMarker} />);
        // }
        return mapComponent;
    }
}

// @inject((store, props) => resolveInjectedProps(store, props, ["data", "viewStore"]))
// class MapDistanceSlider extends React.Component {
//     onLayout = ({ nativeEvent: { layout } }) => {
//         let { viewStore } = this.props;
//         let { height } = layout;
//         viewStore.set("distanceSliderHeight", height - 28);
//     };
//
//     render() {
//         let { stops, ...restProps } = this.props;
//         let showDistanceSlider = stops && stops.length;
//         let component = showDistanceSlider ? <DistanceSlider stops={stops} {...restProps} /> : null;
//         if (Platform.OS !== "web") {
//             let boxStyle = {
//                 position: "absolute",
//                 bottom: 0,
//                 left: 0,
//                 right: 0,
//                 zIndex: 50
//             };
//             component = (
//                 <Box pt={28} onLayout={this.onLayout} style={{ ...boxStyle }} bg={"transparent"}>
//                     {component}
//                 </Box>
//             );
//         }
//         return component;
//     }
// }




