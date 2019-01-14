import React, { Component } from "react";
import uuid from "uuid";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { isObservableArray } from "mobx";
let google = undefined;
let geocoder = undefined;

@observer
export default class ReactMapView extends Component {
    constructor(props) {
        super(props);
        this.mapId = uuid.v4();
        this.mapState = observable.map({});
    }

    componentDidMount() {
        google = window.google;
        console.log("google>>>>>"+JSON.stringify(google))
        if (!google) {
            return;
        }
        let { markers, polyline } = this.props;
        // MarkerAnimation(google);
        geocoder = new google.maps.Geocoder();
        this.createMap();
        this.addMapMarkers(markers);
        this.setPolylineInMap(polyline);
        let inBoundMarkers = getInBoundMarkers(markers);
        setTimeout(() => {
            this.fitMarkersInBounds(inBoundMarkers);
        }, 1000);
    }

    createMap() {
        let { zoom, minZoom, maxZoom, defaultLocation, mapType, customMapStyle } = this.props;
        let mapOptions = {
            mapTypeId: mapType === "standard" ? "roadmap" : mapType,
            zoom: zoom || 8,
            maxZoom: maxZoom || 18,
            minZoom: minZoom || 3,
            center: this.getLatlng(defaultLocation.latitude || 0, defaultLocation.longitude || 0),
            styles: customMapStyle
        };

        let mapDiv = document.getElementById(this.mapId);
        console.log("mapDiv>>>>",mapDiv)
        let map = new google.maps.Map(mapDiv, mapOptions);

        map.addListener("dblclick", () => {
            this.dblclick = true;
            setTimeout(_ => (this.dblclick = false), 100);
        });

        mapDiv.addEventListener("mousedown", event => {
            let rightClick = void 0;
            if (event.which === 3) {
                rightClick = true;
            } else {
                // Internet Explorer before version 9
                if (event.button === 2) {
                    rightClick = true;
                }
            }
            if (rightClick) {
                let double = this.lastPress && new Date().getTime() - this.lastPress;
                if (double && double < 500) {
                    this.dblclick = true;
                }
                this.lastPress = this.dblclick ? void 0 : new Date().getTime();
            }
        });

        map.addListener("drag", () => {
            this.dragging = true;
        });

        map.addListener("bounds_changed", () => {
            this.bounds_changed = true;
            this.regionChange();
        });

        map.addListener("zoom_changed", () => {
            this.zoom_changed = true;
            this.regionChange();
        });

        // if (mapDiv.addEventListener) {
        //   // Internet Explorer, Opera, Google Chrome and Safari
        //   mapDiv.addEventListener("mousewheel", this.isScrollWheel);
        //   // Firefox
        //   mapDiv.addEventListener("DOMMouseScroll", this.isScrollWheel);
        //   mapDiv.addEventListener("MozMousePixelScroll", this.isScrollWheel);
        // } else if (mapDiv.attachEvent) {
        //   // IE before version 9
        //   mapDiv.attachEvent("onmousewheel", this.isScrollWheel);
        // }

        this.mapState.set("map", map);
        console.log("return createMap")
    }

    // isScrollWheel = () => {
    //   this.scrollWheel = true;
    // };

    regionChange = () => {
        let { onRegionChangeByUser } = this.props;
        if (
            (this.scrollWheel || this.dragging || this.dblclick || this.rightclick) &&
            (this.zoom_changed || this.bounds_changed)
        ) {
            onRegionChangeByUser && onRegionChangeByUser();
        }

        this.scrollWheel = false;
        this.dragging = false;
        this.dblclick = false;
        this.rightclick = false;
        this.zoom_changed = false;
        this.bounds_changed = false;
    };

    removePreviousPolyline = () => {
        this.polyline &&
        this.polyline.forEach(prevPolyline => {
            prevPolyline && prevPolyline.setMap && prevPolyline.setMap(null);
        });
        this.polyline = [];
    };

    setPolylineInMap = polyline => {
        let map = this.mapState.get("map");
        this.removePreviousPolyline();
        if (!polyline || !map) {
            return;
        }
        polyline = isArray(polyline) ? polyline : [polyline];
        if (!polyline.length) {
            return;
        }
        polyline.forEach(_polyline => {
            let { strokeWeight, strokeColor, strokeOpacity, path } = _polyline;
            if (path && path.length > 1) {
                let polylinePath = [];
                for (var i = 0; i < path.length; i++) {
                    let { latitude, longitude } = path[i];
                    polylinePath.push(this.getLatlng(latitude, longitude));
                }
                let mapPolyline = new google.maps.Polyline({
                    path: polylinePath,
                    strokeColor: strokeColor || "#F00",
                    strokeWeight: strokeWeight || 1,
                    strokeOpacity: strokeOpacity || 1.0,
                    map
                });
                this.polyline = this.polyline || [];
                this.polyline.push(mapPolyline);
            }
        });
    };

    fitMarkersInBounds = markersArray => {
        if (!markersArray || !markersArray.length) {
            return;
        }
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markersArray.length; i++) {
            var _marker = markersArray[i];
            var myLatLng = _marker.getPosition ? _marker.getPosition() : this.getLatlng(_marker.latitude, _marker.longitude);
            bounds.extend(myLatLng);
        }
        this.fitBounds(bounds);
    };

    getLatlng = (lat, lng) => new google.maps.LatLng(lat, lng);

    addMapMarkers = (markers = []) => {
        if (markers && markers.length) {
            for (var i = 0; i < markers.length; i++) {
                this.addMarker(markers[i]);
            }
        }
    };

    addMarker = markerInfo => {
        var _image = markerInfo.svgImage || markerInfo.image;
        if (_image && Array.isArray(_image)) {
            for (var i in _image) {
                let _markerInfo = { ...markerInfo };
                _markerInfo.id = markerInfo.id + "__" + i;
                if (markerInfo.svgImage) {
                    _markerInfo.svgImage = _image[i];
                } else {
                    _markerInfo.image = _image[i];
                }
                this.addMarker(_markerInfo);
            }
            return;
        }
        let map = this.mapState.get("map");
        this.markersObject = this.markersObject || {};
        let _markerToUpdate = this.markersObject[markerInfo.id];
        if (_markerToUpdate) {
            for (let k in markerInfo) {
                /*for updating more properties of marker if updated from user*/
                _markerToUpdate[k] = markerInfo[k];
            }
            this.updateMarker(this.markersObject[markerInfo.id], markerInfo);
        } else {
            /*this function is called in recursion if svgImage or image is appeared to be array*/
            _markerToUpdate = new google.maps.Marker({
                position: this.getLatlng(markerInfo.latitude, markerInfo.longitude),
                title: markerInfo.title,
                id: markerInfo.id,
                draggable: markerInfo.draggable,
                inBounds: markerInfo.inBounds,
                map: map
            });
            this.markersObject[markerInfo.id] = _markerToUpdate;
        }
        this.setIcon(_markerToUpdate, markerInfo);
        this.updateInfoWindow(_markerToUpdate, markerInfo);
    };

    getImage = (image, scale, anchor) => {
        let icon = {
            url: `${image}`,
            origin: new google.maps.Point(0, 0)
        };
        if (scale) {
            icon.scaledSize = new google.maps.Size(scale.w, scale.h);
        }
        if (anchor) {
            icon.anchor = new google.maps.Point(anchor.w, anchor.h);
        }
        return icon;
    };

    fitBounds = bounds => {
        let map = this.mapState.get("map");
        map.fitBounds(bounds);
        /*panBy(x:number, y:number) is used to change the center of the map to reposition the moving marker
           * which was disappearing on crossing half the distance of the window bounds. --Priti Dhammi, Rohit Garg */
        map.panBy(0, 0);
        this.mapState.set("map", map);
    };

    CheckAndFitMarkersInBounds = markers => {
        if (!markers || !markers.length) {
            return;
        }
        let fitInBound = false;
        for (var i = 0; i < markers.length; i++) {
            var _marker = markers[i];
            /*If current marker updates goes out of bound then all markers are set within bounds*/
            if (!this.checkIsInBounds(_marker)) {
                fitInBound = true;
                break;
            }
        }
        if (fitInBound) {
            this.fitMarkersInBounds(markers);
        }
    };

    /*
     *InfoWindow needs to update when location is reselected by user from GooglePlaceBox - Rohit Garg - 19 May, 2018
     * */
    updateInfoWindow = (marker, markerInfo) => {
        let map = this.mapState.get("map");
        let infowindow = void 0;
        let { showInfoWindow, infoWindow } = markerInfo;
        if (infoWindow !== undefined) {
            if (marker.infowindow) {
                infowindow = marker.infowindow;
            } else {
                infowindow = new google.maps.InfoWindow();
                marker.infowindow = infowindow;
                if (showInfoWindow) {
                    infowindow.open(map, marker);
                }
                google.maps.event.addListener(marker, "click", e => {
                    if (infowindow.getMap() !== null && showInfoWindow) {
                        infowindow && infowindow.close();
                    }
                    infowindow.open(map, marker);
                });
            }
            infowindow.setContent(infoWindow);
        }
        if (markerInfo.draggable) {
            infowindow && infowindow.open(map, marker);
            google.maps.event.addListener(marker, "dragend", event => {
                infowindow && infowindow.close();
                this.props.onChangeLocation && this.props.onChangeLocation(event.latLng, geocoder);
                map.panTo(marker.getPosition());
            });
        }
    };

    setIcon = (marker, markerInfo) => {
        let image = markerInfo.svgImage || markerInfo.image;
        if (!image) {
            return;
        }

        if (typeof image === "object") {
            // svg image case
            let markerIcon = marker.icon;
            if (!markerIcon) {
                image.anchor = new google.maps.Point(400, 200);
                marker.setIcon(image);
            } else if (
                (markerInfo.rotation && markerIcon.rotation !== markerInfo.rotation) ||
                markerIcon.fillColor !== image.fillColor
            ) {
                markerIcon.fillColor = image.fillColor;
                if (markerInfo.rotation) {
                    markerIcon.rotation = markerInfo.rotation;
                }
                marker.setIcon(markerIcon);
            }
        } else {
            marker.setIcon(this.getImage(image, markerInfo.scale, markerInfo.anchor));
        }
    };

    /* by default we have added animation to all markers on moving*/
    updateMarker = (marker, markerInfo) => {
        let { animation } = this.props;
        if (markerInfo.latitude && markerInfo.longitude) {
            var latlng = this.getLatlng(markerInfo.latitude, markerInfo.longitude);
            if (animation !== false && marker.animateTo) {
                marker.animateTo(latlng, animation);
            } else {
                marker.setPosition(latlng);
            }
        }
        if (markerInfo.inBounds !== marker.inBounds) {
            marker.inBounds = markerInfo.inBounds;
        }
    };

    checkIsInBounds = marker => {
        if (marker && marker.inBounds) {
            let map = this.mapState.get("map");
            return map.getBounds() && map.getBounds().contains(marker.getPosition());
        }
    };

    updateMapType = mapType => {
        let map = this.mapState.get("map");
        map && map.setMapTypeId(mapType);
    };

    removeMarkers = markers => {
        if (this.markersObject) {
            /*
                 * Required for delete marker case
                 * */
            let idsToExist = markers.map(m => m.id);
            for (var id in this.markersObject) {
                if (idsToExist.indexOf(id) === -1) {
                    let _marker = this.markersObject[id];
                    delete this.markersObject[id];
                    _marker && _marker.setMap(null);
                }
            }
        }
    };

    componentWillReceiveProps(nextProps) {
        if (!google) {
            return;
        }
        let { markers = [], fitInBound, mapType, polyline } = nextProps;
        this.removeMarkers(markers);
        this.addMapMarkers(markers);
        let inBoundMarkers = getInBoundMarkers(markers);
        if (fitInBound) {
            this.fitMarkersInBounds(inBoundMarkers);
        } else {
            this.CheckAndFitMarkersInBounds(inBoundMarkers.map(marker => this.markersObject[marker.id]));
        }
        this.setPolylineInMap(polyline);
        if (mapType !== this.props.mapType) {
            this.updateMapType(mapType);
        }
    }

    render() {
        let { mapLayoutStyle } = this.props;
        console.log("render called")
        return (
            <div
                style={{
                    flex: 1,
                    position:"absolute",
                    top:0,
                    right:0,
                    left:0,
                    bottom:0,
                    ...mapLayoutStyle
                }}
                id={this.mapId}
            />
        );
    }
}


const getInBoundMarkers = markers => {
    let inBoundMarkers = [];
    if (markers) {
        for (let i = 0; i < markers.length; i++) {
            let marker = markers[i];
            if (marker.inBounds) {
                inBoundMarkers.push(marker);
            }
        }
    }
    return inBoundMarkers;
};


export const isArray = data => {
    return Array.isArray(data) || isObservableArray(data);
};

