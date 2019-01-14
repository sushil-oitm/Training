import React from "react";
import { inject } from "mobx-react";
import  GoogleMap from "./Mapcomponent";

// @inject((store, props) => resolveInjectedProps(store, props, ["keepAwake"]))
export default class ReactGoogleMap extends React.Component {
    constructor(props) {
        super(props);
        // this.edgePadding = Platform.OS === "android" ? 120 : 60;
        this.edgePadding = 120;
    }

    // componentDidMount() {
    //     let { keepAwake } = this.props;
    //     keepAwake && keepAwake.activate();
    // }
    //
    // componentWillUnmount() {
    //     let { keepAwake } = this.props;
    //     keepAwake && keepAwake.deactivate();
    // }

    render() {
        console.log("map called>>>")
        return (
            <GoogleMap
                minZoom={3}
                maxZoom={17}
                defaultLocation={{ latitude: 28.6139, longitude: 77.2090 }}
                rotateEnabled={false}
                pitchEnabled={false}
                moveOnMarkerPress={false}
                customMapStyle={getCustomMapStyles()}
                edgePadding={{
                    top: this.edgePadding,
                    right: this.edgePadding,
                    bottom: this.edgePadding,
                    left: this.edgePadding
                }}
                {...this.props}
            />
        );
    }
}

const getCustomMapStyles = () => {
    return [
        {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ visibility: "off" }]
        },
        {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#000000" }]
        },
        {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#7b7b7b" }]
        },
        {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#7b7b7b" }]
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#8d8d8d" }]
        },
        {
            featureType: "water",
            elementType: "all",
            stylers: [{ visibility: "off" }]
        },
        {
            featureType: "transit",
            stylers: [{ visibility: "off" }]
        }
    ];
};
