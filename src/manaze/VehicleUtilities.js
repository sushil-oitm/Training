import moment from "moment";
import { isObservableArray } from "mobx";
const STOPS = "trip_detail";
 const VEHICLE = "vehicle";
 export const VEHICLE_NUMBER = "number";
 const VEHICLE_DEVICE = "device";
 const VEHICLE_DEVICE_IMEI = "imei";
 const TRIP_NAME = "name";
 const TRIP_TYPE = "trip_type";
 const START_TIME = "start_time";
 const UTC_END_TIME = "utc_end_time";
 const STOP_PASSENGER = "passenger";
 const STOP_STUDENTS = "studentDetails";
 const STOP_STUDENTS_PARENT = "parent";
 const STOP_STUDENTS_STUDENT = "student";
 const STOP_LATITUDE = "lat";
 const STOP_LONGITUDE = "long";
 const STOP_NAME = "stop";
 const DRIVER_NAME = "driver_name";
 const DRIVER_NUMBER = "driver_no";
 const DRIVER_IMAGE = "driver_image";
 const CONDUCTOR_NAME = "conductor_name";
 const CONDUCTOR_NUMBER = "conductor_no";
 const CONDUCTOR_IMAGE = "conductor_image";
 const CHILD_NAME = "name";
 const CHILD_CLASS_NAME = "className";
 const CHILD_IMAGE = "image";


 export class Platform {
     static OS = "web";
 }
 const HISTORY_SPAN = 30;

 export const TRIP_TYPES = {
     PICK_UP :"PickUp",
     DROP:"Drop"
 }

 export const MAP_TYPES = {
     STANDARD:  Platform.OS === "web" ? "roadmap" : "standard",
     HYBRID: "hybrid"
 };

 export const ACTIONS = {
     ONLY_VEHICLE: "onlyVehicle",
     SHOW_HYBRID: "showHybrid",
     SHOW_STOPS: "showStops"
 };

 export const LOCATION = {
     TRANSIT_TIME:"transitTime",
     IDLE_TIME : "idleTime",
     TOTAL_IDLE_TIME:"totalIdleTime",
     NO_SIGNAL_TIME : "noSignalTime",
     OVER_SPEED : "overSpeed",
     HALT:"halt"
 }

 export const getIMEI = (data) => {
     return data[VEHICLE_DEVICE] && data[VEHICLE_DEVICE][VEHICLE_DEVICE_IMEI];
 }

 export const getHistoryStartTime = (data) => {
     let utcStartTime = data && data[START_TIME];
     if(!utcStartTime){
         return;
     }
     return new Date(utcStartTime);
     utcStartTime = utcStartTime - HISTORY_SPAN;
     let startTime =  moment.utc().startOf("day").add(utcStartTime, "minutes").toDate();
     return startTime;
 }

 export const getVehicle = (data) => {
     return data[VEHICLE];
 }

 export const getStops = (data) => {
     return data[STOPS] || [];
 }

 export const getTitle = (data) => {
     return data && data[VEHICLE_NUMBER];
 }

 export const getSpeedLatencyFormat = (location, latencyTime = 60000)=> {
     let lastSignalTime = location && location.serverTime;
     if(!lastSignalTime){
         return;
     }
     let currentUtcDate = moment.utc().toDate();
     let lastSignalUtcDate = new Date(lastSignalTime);
     if(currentUtcDate-lastSignalUtcDate > latencyTime){
         return moment(lastSignalTime).fromNow()
     }
 };

 export const getInfoWindow = (data, {location}) => {
     if(!data){
         return;
     }
     let {latitude, longitude} = location || {}
     let infoWindow = `${data[VEHICLE_NUMBER] || "-"} , ${location.speed || 0} km/h`;
     let speedLatencyFormat = getSpeedLatencyFormat(location);
     if (speedLatencyFormat) {
         infoWindow += `<br />${speedLatencyFormat}`;
     }
     if(latitude && longitude){
         infoWindow += `<br />Latitude: ${latitude}`;
         infoWindow += `<br />Longitude: ${longitude}`;
     }
     return infoWindow;
 }

 export const subscribeVehicle = ({gpsStore, data, uid}) => {
     if(!data){
         return;
     }
     if(isArray(data)){
         data.forEach(row=>{
             gpsStore.subscribe({imei: getIMEI(row), uid});
         })
     }else{
         gpsStore.subscribe({imei: getIMEI(data), uid});
     }
 }

 export const unsubscribeVehicle = ({gpsStore, data, uid}) => {
     if(!data){
         return;
     }
     if(isArray(data)){
         data.forEach(row=>{
             gpsStore.subscribe({imei: getIMEI(row), uid});
         })
     }else{
         gpsStore.unsubscribe({imei: getIMEI(data), uid});
     }
 }

 export const getSpeed = (props) => {
     let location = getLocation(props);
     return `${location && location.speed || 0} Km/h`;
 }

 export const getLastSpeedTimeFormat = (props) => {
     return getSpeedLatencyFormat(getLocation(props), 0);
 }

 export const getLatitude = (props) => {
     let location = getLocation(props);
     return location && location.latitude;
 }

 export const getLongitude = (props) => {
     let location = getLocation(props);
     return location && location.longitude;
 }

 export const getLocation = ({gpsStore, data}) => {
     return gpsStore &&  gpsStore.getLocation({imei: getIMEI(data)});
 };

 export const getCoveredStops = ({gpsStore, data}) => {
     return gpsStore.getCoveredStops({ imei: getIMEI(data) });
 };

 export const isSubscribed = ({gpsStore, data}) => {
     return gpsStore.isSubscribed({imei: getIMEI(data)});
 };

 export const getActiveTrip = (trips)=> {
     if(trips){
         for (var i = 0; i < trips.length; i++) {
             if(trips[i].status === "Active"){
                 return trips[i];
             }
         }
     }
 }

 const isArray = (value) => {
     return Array.isArray(value) || isObservableArray(value);
 }

 export const isActiveTrip = data => {
     data = data || {};
     let utcStartTime = data[START_TIME];
     let utcEndTime = data[UTC_END_TIME];
     utcStartTime = utcStartTime && Number(utcStartTime);
     utcEndTime = utcEndTime && Number(utcEndTime);
     let date = new Date();
     let currentTimeInUtcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
     if (
         (!utcStartTime || utcStartTime - 30 <= currentTimeInUtcMinutes) &&
         (!utcEndTime || utcEndTime + 30 >= currentTimeInUtcMinutes)
     ) {
         return true;
     }
 };

 export const getActiveVehicles = data => {
     return data
         ? data.reduce((prev, current) => {
             if (isActiveTrip(current)) {
                 prev[current._id] = current;
             }
             return prev;
         }, {})
         : {};
 };

 export const isMyStop = (passenger, user)=> {
     let userId = user && user._id;
     if(userId && passenger){
         if(!isArray(passenger)){
             passenger = [passenger];
         }
         for (let i = 0; i < passenger.length; i++) {
             if (passenger[i] && userId === passenger[i]._id) {
                 return true;
             }
         }
     }
 }

 export const getPickupStopInfo = (stops, user) => {
     for (let i = 0; i < stops.length; i++) {
         let stop = stops[i];
         let myStop = isMyStop(stop[STOP_PASSENGER], user);
         if (myStop) {
             let stopStudents = stop[STOP_STUDENTS];
             if(stopStudents){
                 for (let k = 0; k < stopStudents.length; k++) {
                     let student = stopStudents[k];
                     let parent = student[STOP_STUDENTS_PARENT];
                     if(isMyStop(parent, user)){
                         return {
                             stop,
                             child : student[STOP_STUDENTS_STUDENT]
                         }
                     }
                 }
             }
             return {
                 stop
             }
         }
     }
 }

 export const getVehicleSuggestions = (vehicles, user) => {
     let vehicleSuggestions = {};
     for (let key in vehicles) {
         let stopInfo = getPickupStopInfo(vehicles[key][STOPS], user);
         let name = (stopInfo && stopInfo.child && stopInfo.child[CHILD_NAME]) || vehicles[key][VEHICLE][VEHICLE_NUMBER];
         vehicleSuggestions[key] = name;
     }
     return vehicleSuggestions;
 }