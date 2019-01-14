import moment from "moment";
// import { getCallOutProps } from "./CalloutView";
import {Platform, getIMEI, getInfoWindow, getTitle, getLocation, LOCATION } from "./../manaze/VehicleUtilities";
import {
    icLocation,
    icSchool,
    idleMarker,
    icEllipse,
    busIcon,
    passedStop,
    pathMarker
} from "../manaze/images/index";

export const STROKE_COLOR = "orange";
export const STROKE_WEIGHT = 4;
export const STOPS = "trip_detail";
export const VEHICLE = "vehicle";
export const VEHICLE_NUMBER = "number";
export const VEHICLE_DEVICE = "device";
export const VEHICLE_DEVICE_IMEI = "imei";
export const TRIP_NAME = "name";
export const TRIP_TYPE = "trip_type";
export const START_TIME = "start_time";
export const UTC_END_TIME = "utc_end_time";
export const STOP_PASSENGER = "passenger";
export const STOP_STUDENTS = "studentDetails";
export const STOP_STUDENTS_PARENT = "parent";
export const STOP_STUDENTS_STUDENT = "student";
export const STOP_LATITUDE = "lat";
export const STOP_LONGITUDE = "long";
export const STOP_NAME = "stop";
export const DRIVER_NAME = "driver_name";
export const DRIVER_NUMBER = "driver_no";
export const DRIVER_IMAGE = "driver_image";
export const CONDUCTOR_NAME = "conductor_name";
export const CONDUCTOR_NUMBER = "conductor_no";
export const CONDUCTOR_IMAGE = "conductor_image";
export const CHILD_NAME = "name";
export const CHILD_CLASS_NAME = "className";
export const CHILD_IMAGE = "image";
const getCallOutProps= ()=>(null)

export const STATUS_COLORS = {
    OVER_SPEED: "red",
    NO_SIGNAL_TIME: "blue",
    IDLE_TIME: "yellow",
    ACTIVE: "green"
};

export const MARKER_TYPES = {
    PICK_UP_STOP_MARKER: "pickupStopMarker",
    DELIVERY_STOP_MARKER: "deliveryStopMarker",
    GENERAL_STOP_MARKER: "generalStopMarker",
    GENERAL_STOP_MARKER_COVERED: "generalStopMarkerCovered",
    IDLE_MARKER: "idleMarker",
    PATH_MARKER: "pathMarker"
};

export const getMarkerImage = type => {
    let image = void 0;
    if (type === MARKER_TYPES.PICK_UP_STOP_MARKER) {
        image = icLocation();
    } else if (type === MARKER_TYPES.DELIVERY_STOP_MARKER) {
        image = icSchool();
    } else if (type === MARKER_TYPES.GENERAL_STOP_MARKER) {
        image = icEllipse();
    } else if (type === MARKER_TYPES.GENERAL_STOP_MARKER_COVERED) {
        image = passedStop();
    } else if (type === MARKER_TYPES.IDLE_MARKER) {
        image = idleMarker();
    } else if (type === MARKER_TYPES.PATH_MARKER) {
        image = pathMarker();
    }
    return image;
};

const getLatLng = data => {
    if (!data) {
        return {};
    }
    let latitude = data[STOP_LATITUDE];
    let longitude = data[STOP_LONGITUDE];
    if (!latitude && !longitude && data.coordinates && data.coordinates.length) {
        longitude = data.coordinates[0];
        latitude = data.coordinates[1];
    }
    return {
        latitude,
        longitude
    };
};

const getISTTime = utcTime => {
    utcTime = utcTime || 0;
    utcTime = utcTime + 330;
    return `${parseInt(utcTime / 60)}:${parseInt(utcTime % 60)}`;
};

export const getStopMarker = (data, type, options = {}) => {
    let { latitude, longitude } = getLatLng(data);
    if (!latitude || !longitude) {
        return;
    }
    let infoWindow = options.infoWindow || data[STOP_NAME];
    let calloutProps = getCallOutProps(options.callout || data[STOP_NAME]);
    let onMarkerClick = options.onMarkerClick;
    let onCloseInfoWindow = options.onCloseInfoWindow;
    return {
        id: data["_id"],
        image: getMarkerImage(type),
        inBounds: options.inBounds !== undefined ? options.inBounds : true,
        title: data[STOP_NAME],
        latitude: typeof latitude === "string" ? parseFloat(latitude) : latitude,
        longitude: typeof longitude === "string" ? parseFloat(longitude) : longitude,
        infoWindow: `${infoWindow ? infoWindow + "<br/>" : ""}${latitude},${longitude} ${data.utc_time ? "<br/>Est" + " Time - " + getISTTime(data.utc_time) : ""}`,
        ...calloutProps,
        onMarkerClick,
        onCloseInfoWindow
    };
};

export const getServerTime = signal => {
    if(!signal || !signal.serverTime){
        return "";
    }
    return `${moment(signal.serverTime).calendar()}`;
};

export const getIdleInfoWindow = (signal, firstSignal) => {
    return `HaltTime : ${firstSignal ? getServerTime(firstSignal) + " - " : ""}${getServerTime(signal)} <br/> Max Interval : ${parseFloat(signal[LOCATION.TOTAL_IDLE_TIME] / 60).toFixed(2)} min`;
};

export const getIdleMarker = (signal, options = {}) => {
    let latitude = signal["latitude"];
    let longitude = signal["longitude"];
    return {
        id: `${latitude}-${longitude}`,
        inBounds: options.inBounds !== undefined ? options.inBounds : true,
        title: "Idle Location",
        image: getMarkerImage(MARKER_TYPES.IDLE_MARKER),
        latitude: typeof latitude === "string" ? parseFloat(latitude) : latitude,
        longitude: typeof longitude === "string" ? parseFloat(longitude) : longitude,
        infoWindow: options.infoWindow || getIdleInfoWindow(signal, options.firstSignal),
        showInfoWindow: options.showInfoWindow !== undefined ? options.showInfoWindow : true
    };
};

export const getDeliveryMarker = stop => {
    return getStopMarker(stop, MARKER_TYPES.DELIVERY_STOP_MARKER);
};

export const getPickupMarker = pickupStop => {
    return getStopMarker(pickupStop, MARKER_TYPES.PICK_UP_STOP_MARKER);
};

export const getGeneralStopMarkers = (stops, pickupMarker, schoolMarker, coveredStops = []) => {
    let generalStopMarkers = [];
    stops.forEach(stop => {
        let stopId = stop._id;
        if ((pickupMarker && pickupMarker.id === stopId) || (schoolMarker && schoolMarker.id === stopId)) {
            return;
        }
        let markerType = coveredStops.indexOf(stopId) > -1
            ? MARKER_TYPES.GENERAL_STOP_MARKER_COVERED
            : MARKER_TYPES.GENERAL_STOP_MARKER;
        generalStopMarkers.push(getStopMarker(stop, markerType));
    });
    return generalStopMarkers;
};

export const updateGeneralMarkers = (generalStopMarkers, coveredStopId) => {
    generalStopMarkers &&
    generalStopMarkers.forEach(marker => {
        if (marker.id === coveredStopId) {
            marker.image = getMarkerImage(MARKER_TYPES.GENERAL_STOP_MARKER_COVERED);
        }
    });
};

export const getStrokeColor = signal => {
    let strokeColor = STROKE_COLOR;
    if (signal) {
        if (signal[LOCATION.OVER_SPEED]) {
            strokeColor = STATUS_COLORS.OVER_SPEED;
        } else if (signal[LOCATION.NO_SIGNAL_TIME]) {
            strokeColor = STATUS_COLORS.NO_SIGNAL_TIME;
        } else if (signal.strokeColor) {
            strokeColor = signal.strokeColor;
        }
    }
    return strokeColor;
};

export const getTracePath = (strokeColor, strokeWeight) => {
    return {
        strokeColor: strokeColor || STROKE_COLOR,
        strokeWeight: strokeWeight || STROKE_WEIGHT
    };
};

export const getStatusColor = props => {
    return getFillColor(getLocation(props));
};

export const getFillColor = location => {
    if (!location || location[LOCATION.NO_SIGNAL_TIME]) {
        return STATUS_COLORS.NO_SIGNAL_TIME;
    } else if (location[LOCATION.IDLE_TIME]) {
        return STATUS_COLORS.IDLE_TIME;
    } else if (location[LOCATION.OVER_SPEED]) {
        return STATUS_COLORS.OVER_SPEED;
    } else {
        return STATUS_COLORS.ACTIVE;
    }
};

export const getVehicleMarker = props => {
    let {
        data,
        icon,
        location = {},
        id,
        title,
        imei,
        infoWindow,
        fillColor,
        showInfoWindow,
        onMarkerClick,
        onCloseInfoWindow
    } = props;
    let { latitude, longitude, angle } = location;
    if (!latitude || !longitude) {
        return;
    }
    icon = icon || busIcon;
    data = data || {};
    let vehicleMarker = {
        id: id || data["_id"] || `vehicle`,
        title: title !== undefined ? title : getTitle(data) || `vehicle`,
        imei: imei || getIMEI(data),
        inBounds: true,
        image: Platform.OS !== "web" && icon(),
        svgImage: Platform.OS === "web" && {
            path: "M542.1,66.7c0,0-0.9-10.4-9.1-10.4c0,0-7.2-1-8.1,3.6l-3,3.8V43.4c0,0-2.6-21.1-25.2-21.1H323.1c0,0-31,1.2-30.9,22.9l0,25.6c0,0,1.2-0.8,3.1-1.6l-3.1,1.6v83.8l0.8,0.4c0.5,0.2,1.3,0.6,2.3,0.9V69.3c4-1.9,10.9-4.1,13.7,0.8c0,0,0.1-0.5,0.5-1.2c0.5-1,1.2-2.4,2.1-3.4c0,0,0-0.1,0.1-0.1c0-0.1-9.3-29.7,12.2-31.2c0,0,113.4-2.9,163.1,0c0,0,27.7-1.3,15.8,29.7c0,0,0,0,0,0c0,0,1.9,1,3.2,2.9c-0.8-1.1-1.9-2-3.2-2.9c0,0,0,0,0,0c0,0,0,0,0,0c-7.2-4.9-21-7.2-21-7.2c-50.2-7.2-152.1,0-152.1,0c-9.8,0.6-15.2,5-17.9,8.7c0,0,0,0,0,0c0,0,0,0.1-0.1,0.1c-1,1.3-1.7,2.6-2.1,3.4c-0.3,0.7-0.5,1.2-0.5,1.2c0,29.7-4.3,82.8-4.3,82.8c-1.8,4.5-6.3,4.1-9.4,3.2v0.2l-2.3-1.1c-0.5-0.2-0.8-0.4-0.8-0.4v30.8c0.2-1.2,2.2-4.4,15.8-5.7c-7.4,0.8-15.8,2.5-15.8,6.3v14h229.7v-12.3c-1.2-0.9-2.4-1.7-3.7-2.4c2.5,1.3,3.7,2.4,3.7,2.4v-40.7c-0.2,0.1-0.3,0.1-0.5,0.2c-0.6,0.3-1.2,0.5-1.8,0.7c-0.2,0.1-0.4,0.1-0.6,0.2v0c-4,0.9-7.3-1-7.3-1c-3.6-3.1-4.7-68-4.8-76.2l0,0c0,0,0-0.1,0-0.1c0-0.2,0-0.4,0-0.5c0-0.2,0-0.4-0.1-0.6c0,0.1,0.1,0.2,0.1,0.3c0,0,0,0.1,0,0.2c0,0.2,0,0.3,0,0.5c0,0,0,0.1,0,0.1c0,0,2.7-5.4,12-1.9v79.1c0.2,0,0.4-0.1,0.6-0.1c0.6-0.2,1.3-0.5,1.8-0.7c0.3-0.1,0.5-0.2,0.5-0.2V67.8l3.3-5.2c0,0,8,1.1,11.5,8.2C536.7,70.9,543.2,73.2,542.1,66.7z M307.1,34.2c-2.1,2-3.4,3.8-5.1,6.2c-1.5,2.1-2.8,5.5-5.1,6.6c-1.9,0.9-2.7-1.3-2.9-2.5c-0.9-6.8,4.7-11.4,10-14C305.7,29.6,309.9,31.4,307.1,34.2z M439.8,30.4h-60.8c-1.8,0-1.8-2.9,0-2.9h60.8C441.7,27.5,441.7,30.4,439.8,30.4z M489,80c0-1,1.5-1,1.5,0v88.1c0,1-1.5,1-1.5,0V80z M479.7,79.7c0-1,1.5-1,1.5,0v88.1c0,1-1.5,1-1.5,0V79.7z M470.2,79.7c0-1,1.5-1,1.5,0v88.4c0,1-1.5,1-1.5,0V79.7z M460.2,79.5c0-1,1.5-1,1.5,0v88.4c0,1-1.5,1-1.5,0V79.5z M380.7,96.5c0-0.6,0.5-0.8,0.9-0.8c0.1,0,0.1,0,0.2,0h56.3c0.7,0,0.6,0.6,0.6,1.2v25.9c0,0.9-1.3,0.8-1.5,0.8c-0.1,0-0.4,0-0.5,0h-55.2c-0.6,0-0.8-0.5-0.8-0.9c0-0.1,0-0.1,0-0.2V96.5z M355.8,80.3c0-1,1.5-1,1.5,0v88.1c0,1-1.5,1-1.5,0V80.3zM346.8,80c0-1,1.5-1,1.5,0v88.6c0,1-1.5,1-1.5,0V80z M337.3,80.3c0-1,1.5-1,1.5,0v87.8c0,1-1.5,1-1.5,0V80.3z M327.5,80.5c0-1,1.5-1,1.5,0v87.8c0,1-1.5,1-1.5,0V80.5z M495.8,191.1c0,3.9-6.8,3.9-6.8,3.9H327.9c-6.8,0-6.5-4.7-6.5-4.7v-11.2c-4.8,0-8.9,0.2-12.2,0.5c5.3-0.5,9.8-0.6,9.8-0.6l2.4,0l174.1,1.4c0,0,1.1,0,2.9,0.1c-0.9,0-1.9-0.1-2.9-0.1L495.8,191.1zM514.4,183.7c-5.1-1.9-10.6-2.7-14.3-3C506.3,181.2,511,182.4,514.4,183.7z M518,43.9c-2.9,0.9-6.2-3.7-8-5.9c-1.9-2.3-6.2-4.2-6.6-7.4c0-2,1.9-2.1,2.6-1.9c2.2,0.7,3,1.1,5,2.3c1.7,1,3.4,2.4,4.5,4.1C516.7,36.7,521,43,518,43.9zM382.3,122.1V97.2h54.9v24.8C437.1,122.1,382.3,122.1,382.3,122.1z M506.6,68c0.1,0.3,0.2,0.6,0.3,0.9C506.8,68.6,506.7,68.3,506.6,68z M292.2,67.8l-3.3-5.2c0,0-8,1.1-11.5,8.2c0,0-6.5,2.3-5.4-4.2c0,0,0.9-10.4,9.1-10.4c0,0,7.2-1,8.1,3.6l3,3.8V67.8z M419.9,202.9h-26.4c-0.1-0.1-0.1-0.3-0.1-0.5v-1.5c0-0.5,0.4-0.9,0.9-0.9h25c0.5,0,0.8,0.4,0.8,0.8v1.5C420,202.6,419.9,202.8,419.9,202.9z M361,202.9h-26.4c-0.1-0.1-0.1-0.3-0.1-0.5v-1.5c0-0.5,0.4-0.9,0.9-0.9h25c0.5,0,0.8,0.4,0.8,0.8v1.5C361.1,202.6,361,202.8,361,202.9z M537,202.9h-58.2c-0.2,0.2-0.4,0.4-0.7,0.4h-25c-0.3,0-0.5-0.2-0.7-0.4h-32.5c-0.2,0.2-0.4,0.4-0.7,0.4h-25c-0.3,0-0.5-0.2-0.7-0.4H361c-0.2,0.2-0.4,0.4-0.7,0.4h-25c-0.3,0-0.5-0.2-0.7-0.4h-58.1c-0.5,0-0.9,0.4-0.9,0.9v576.5c0,0.5,0.4,0.8,0.8,0.8H537c0.5,0,0.9-0.4,0.9-0.9V203.7C537.8,203.3,537.4,202.9,537,202.9z M283.2,218.6c0-0.5,0.4-0.9,0.9-0.9h1.5c0.5,0,0.8,0.4,0.8,0.8v546c0,0.5-0.4,0.9-0.9,0.9h-1.5c-0.5,0-0.8-0.4-0.8-0.8V218.6z M529.1,772.8c0,0.5-0.4,0.9-0.9,0.9H283.8c-0.5,0-0.8-0.4-0.8-0.8V771c0-0.5,0.4-0.9,0.9-0.9h244.5c0.5,0,0.8,0.4,0.8,0.8V772.8z M311.4,717.5V261.7c0-1,1.5-1,1.5,0v455.8C313,718.5,311.4,718.5,311.4,717.5z M336.8,717.5V261.7c0-1,1.5-1,1.5,0v455.8C338.3,718.5,336.8,718.5,336.8,717.5z M364.2,717.5V261.7c0-1,1.5-1,1.5,0v455.8C365.7,718.5,364.2,718.5,364.2,717.5z M393.7,717.5V261.7c0-1,1.5-1,1.5,0v455.8C395.3,718.5,393.7,718.5,393.7,717.5zM420.1,717.5V261.7c0-1,1.5-1,1.5,0v455.8C421.7,718.5,420.1,718.5,420.1,717.5z M446.5,717.7V261.7c0-1,1.5-1,1.5,0v455.9C448,718.7,446.5,718.7,446.5,717.7z M476,717.5V261.7c0-1,1.5-1,1.5,0v455.8C477.6,718.5,476,718.5,476,717.5z M500.3,717.5V261.7c0-1,1.5-1,1.5,0v455.8C501.8,718.5,500.3,718.5,500.3,717.5z M529.1,764.6c0,0.5-0.4,0.9-0.9,0.9h-1.5c-0.5,0-0.8-0.4-0.8-0.8v-546c0-0.5,0.4-0.9,0.9-0.9h1.5c0.5,0,0.8,0.4,0.8,0.8V764.6z M529.1,211.5c0,0.5-0.4,0.9-0.9,0.9H284.1c-0.5,0-0.8-0.4-0.8-0.8v-1.4c0-0.5,0.4-0.9,0.9-0.9h244.2c0.5,0,0.8,0.4,0.8,0.8V211.5z M478.8,202.9h-26.4c-0.1-0.1-0.1-0.3-0.1-0.5v-1.5c0-0.5,0.4-0.9,0.9-0.9h25c0.5,0,0.8,0.4,0.8,0.8v1.5C478.9,202.6,478.9,202.8,478.8,202.9z",
            fillColor: fillColor || "green",
            fillOpacity: 2,
            scale: 0.05
        },
        rotation: typeof angle === "string" ? parseInt(angle) : angle,
        latitude: typeof latitude === "string" ? parseFloat(latitude) : latitude,
        longitude: typeof longitude === "string" ? parseFloat(longitude) : longitude,
        infoWindow: infoWindow || getInfoWindow(data, { location }),
        showInfoWindow,
        onMarkerClick,
        onCloseInfoWindow
    };
    return vehicleMarker;
};

export const addPolyline = (signal, polylines) => {
    let { latitude, longitude, strokeWeight } = signal || {};
    if (latitude && longitude) {
        latitude = typeof latitude === "string" ? parseFloat(latitude) : latitude;
        longitude = typeof longitude === "string" ? parseFloat(longitude) : longitude;
        strokeWeight = strokeWeight || STROKE_WEIGHT;
        let strokeColor = getStrokeColor(signal);

        let lastPolyline = polylines && polylines.length ? polylines[polylines.length - 1] : void 0;
        let path = { latitude, longitude };
        if (lastPolyline && (lastPolyline.strokeColor === strokeColor && lastPolyline.strokeWeight === strokeWeight)) {
            lastPolyline.path.push(path);
        } else {
            let newPath = [];
            if (lastPolyline) {
                let lastPolylinePath = lastPolyline.path;
                newPath.push(lastPolylinePath[lastPolylinePath.length - 1]);
            }
            newPath.push(path);
            polylines.push({ strokeColor, strokeWeight, path: newPath });
        }
    }
};

export const mergeHistoryPolyline = (historyData, polyline) => {
    let historyLength = historyData ? historyData.length : 0;
    if (!historyLength) {
        return;
    }

    let historyPolyline = [];
    for (var i = 0; i < historyLength; i++) {
        addPolyline(historyData[i], historyPolyline);
    }
    let polylineFirstPath = polyline && polyline[0] && polyline[0].path;
    if (polylineFirstPath) {
        let lastHistoryPolyline = historyPolyline[historyPolyline.length - 1];
        let lastHistoryPath = lastHistoryPolyline.path[lastHistoryPolyline.path.length - 1];
        polylineFirstPath.unshift(lastHistoryPath);
    }
    for (var i = historyPolyline.length - 1; i >= 0; i--) {
        polyline.unshift(historyPolyline[i]);
    }
};

export const getPathMarker = (signal, options = {}) => {
    let pathMarker = getStopMarker(
        {
            _id: signal._id,
            [STOP_LATITUDE]: signal.latitude,
            [STOP_LONGITUDE]: signal.longitude
        },
        MARKER_TYPES.PATH_MARKER,
        {
            title: "Path Marker",
            ...options
        }
    );
    pathMarker.infoWindow = `${pathMarker.infoWindow}<br/> ${getServerTime(signal)}`;
    return pathMarker;
};

export const getCoveredStopMarker = (signal, options) => {
    let { coveredStop, latitude, longitude } = signal || {};
    if (!signal) {
        return;
    }
    if (!coveredStop) {
        return;
    }
    let generalStopMarker = getStopMarker(
        {
            ...coveredStop,
            latitude: latitude,
            longitude: longitude
        },
        MARKER_TYPES.GENERAL_STOP_MARKER,
        {
            infoWindow: `${coveredStop.stop} <br/> Time : ${getServerTime(signal)}`,
            ...options
        }
    );
    return generalStopMarker;
};
