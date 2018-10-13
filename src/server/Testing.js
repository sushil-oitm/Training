var self = require("./Util")
var QueryString = require("querystring");
var http = require("http");
var Q = require("q")
var config = require("../context_rahul");
var objectID = require('mongodb').ObjectID;
var DBS = {};
var nodemailer = require("nodemailer");
var Socket = require("./NotifyNewAutoload");
var imeiDataTemp={};


exports.saveData = function (data, imeiData) {
    var finalInsert = [];
    var sendAlert=false;
    var finalGpsUpdate = [];
    if (data && data.length > 0) {
        return iterate(data, Q,
            function (index, arrayData) {
                var lastLogRecord = arrayData.last_data;
                var update = {};
                delete arrayData.last_data;
                if(arrayData){
                    var d1={
                        "latitude": arrayData.latitude,
                        "longitude": arrayData.longitude,
                        "speed": arrayData.speed,
                        "device_time": arrayData.device_time,
                        // "last_data": lastLogRecord,
                        "imei": arrayData.imei,
                        "acc_status": arrayData.acc_status,
                        "server_time": arrayData.server_time,
                        // "history_data": gpsdata.history_data,
                        "angle": arrayData.angle,
                    }
                    Socket.notifyAutoloadSocket(d1);
                }
                if (lastLogRecord) {
                    lastLogRecord.device_time = lastLogRecord.device_time ? new Date(lastLogRecord.device_time) : undefined;
                    lastLogRecord.latitude = lastLogRecord.latitude ? Number(lastLogRecord.latitude) : undefined;
                    lastLogRecord.longitude = lastLogRecord.longitude ? Number(lastLogRecord.longitude) : undefined;
                }
                else if(imeiDataTemp && imeiDataTemp[arrayData.imei.toString()].temp){
                    lastLogRecord=imeiDataTemp[arrayData.imei.toString()].temp
                    lastLogRecord.device_time = lastLogRecord.device_time ? new Date(lastLogRecord.device_time) : undefined;
                    lastLogRecord.latitude = lastLogRecord.latitude ? Number(lastLogRecord.latitude) : undefined;
                    lastLogRecord.longitude = lastLogRecord.longitude ? Number(lastLogRecord.longitude) : undefined;
                }
                else{
                    update["last_data"]=false;
                }
                if(!imeiDataTemp[arrayData.imei.toString()]){
                    imeiDataTemp[arrayData.imei.toString()]={}
                }
                imeiDataTemp[arrayData.imei.toString()].temp=arrayData

                if (arrayData) {
                    arrayData.device_time = arrayData.device_time ? new Date(arrayData.device_time) : undefined;
                    arrayData.latitude = arrayData.latitude ? Number(arrayData.latitude) : undefined;
                    arrayData.longitude = arrayData.longitude ? Number(arrayData.longitude) : undefined;
                }
                if (arrayData && lastLogRecord) {
                    arrayData.last_device_time = lastLogRecord.device_time;
                }
                if (lastLogRecord && lastLogRecord.latitude && lastLogRecord.longitude && lastLogRecord.device_time && arrayData && arrayData.latitude && arrayData.longitude && arrayData.device_time && arrayData.device_time > lastLogRecord.device_time && !arrayData.history_data) {
                    var timeDiff = (arrayData.device_time - lastLogRecord.device_time) / 1000;
                    var latitudeDiff = Math.abs(arrayData.latitude - lastLogRecord.latitude);
                    var longitudeDiff = Math.abs(arrayData.longitude - lastLogRecord.longitude);
                    var sameLocationAccuracy = 0.000009;
                    var noSignalTimeAccuracy = 60;
                    var distanceTravled = getDistanceFromLatLonInKm(lastLogRecord.latitude, lastLogRecord.longitude, arrayData.latitude, arrayData.longitude)
                    if (timeDiff > noSignalTimeAccuracy) {
                        if (timeDiff < (7 * 24 * 3600)) {
                            arrayData.no_signal_time = timeDiff;
                            if (distanceTravled > 0) {
                                arrayData.distance_traveled = distanceTravled;
                                /*arrayData.transit_time = timeDiff;*/
                            }
                        }
                    } else if (latitudeDiff <= sameLocationAccuracy && longitudeDiff <= sameLocationAccuracy) {
                        arrayData.idle_time = timeDiff;
                    } else {
                        if (distanceTravled > 0) {
                            arrayData.distance_traveled = distanceTravled;
                            arrayData.transit_time = timeDiff;
                        }else{
                            arrayData.idle_time = timeDiff;
                        }

                    }
                }

                update.altitude = arrayData.altitude;
                update.latitude = arrayData.latitude;
                update.longitude = arrayData.longitude;
                update.speed = arrayData.speed;
                //update.imei = arrayData.imei;
                update.angle = arrayData.angle;
                update.device_time = arrayData.device_time;
                update.server_time = arrayData.server_time;
                update.remote_address = arrayData.remote_address;
                update.acc_status = arrayData.acc_status ? true : false;
                update.created_on = new Date();
                update.start_time = new Date();
                update.history_data = arrayData.history_data;
                update.imei = arrayData.imei.toString()
                var updateForGPS = {}


                if (arrayData.marked) {
                    update.marked = arrayData.marked;
                }
                if (arrayData.distance_traveled) {
                    update.distance_traveled = arrayData.distance_traveled;
                }
                if (arrayData.idle_time) {
                    update.idle_time = arrayData.idle_time;
                }
                if (arrayData.no_signal_time) {
                    update.no_signal_time = arrayData.no_signal_time;
                }
                update.running_status = (arrayData.idle_time && arrayData.idle_time > 0) ? "i" : "r";
                if (arrayData.transit_time) {
                    update.transit_time = arrayData.transit_time;
                }

                if (arrayData.last_device_time) {
                    update.last_device_time = arrayData.last_device_time;
                }

                if (lastLogRecord && lastLogRecord.hasOwnProperty('powercut')) {
                    update.powercut = lastLogRecord.powercut;
                    update.powercut_time = new Date();

                }
                if (lastLogRecord && lastLogRecord.hasOwnProperty('gpsoff')) {
                    update.gpsoff = lastLogRecord.gpsoff;
                    update.gpsoff_time = new Date();
                }
                if (lastLogRecord && lastLogRecord.hasOwnProperty('chargeconnect')) {
                    update.chargeconnect = lastLogRecord.chargeconnect;
                    update.chargeconnect_time = new Date();
                }


                if (imeiData[arrayData.imei.toString()] != undefined){
                    updateForGPS = {
                        _id:imeiData[arrayData.imei.toString()]._id,
                        latitude:arrayData.latitude,
                        longitude:arrayData.longitude,
                        speed:arrayData.speed,
                        time:new Date(),
                        acc_status:arrayData.acc_status ? true : false,
                        running_status:(arrayData.idle_time && arrayData.idle_time > 0) ? "i" : "r"
                    };

                    if(imeiData[arrayData.imei.toString()].powercut && update.speed && update.speed > 0){
                        updateForGPS.sendAlert = true;
                        updateForGPS.alert_time = new Date();
                        updateForGPS.speed = update.speed;
                    }
                    if (lastLogRecord && lastLogRecord.hasOwnProperty('powercut')) {
                        // if( !imeiData[arrayData.imei.toString()].hasOwnProperty('powercut') || imeiData[arrayData.imei.toString()].hasOwnProperty('powercut') && imeiData[arrayData.imei.toString()].powercut!=lastLogRecord.powercut){
                        //     console.log("imei befor>>>>>"+JSON.stringify(imeiData[arrayData.imei.toString()].powercut))
                        //     console.log("last data>>>"+lastLogRecord.powercut)
                        //     sendAlert=true;
                        // }
                        imeiData[arrayData.imei.toString()].powercut=lastLogRecord.powercut;
                        updateForGPS.powercut = lastLogRecord.powercut;
                        updateForGPS.powercut_time = new Date();
                        updateForGPS.sendAlert = false;
                        // console.log("imei after>>>>>"+JSON.stringify(imeiData[arrayData.imei.toString()].powercut))

                    }
                    if (lastLogRecord && lastLogRecord.hasOwnProperty('gpsoff')) {
                        updateForGPS.gpsoff = lastLogRecord.gpsoff;
                        updateForGPS.gpsoff_time = new Date();
                    }
                    if (lastLogRecord && lastLogRecord.hasOwnProperty('chargeconnect')) {
                        updateForGPS.chargeconnect = lastLogRecord.chargeconnect;
                        updateForGPS.chargeconnect_time = new Date();
                    }
                }
                //insertDataToTrackLogs(arrayData, finalInsert, dbs)
                if (Object.keys(update).length > 0) {
                    finalInsert.push(update);
                }
                if (Object.keys(updateForGPS).length > 0) {
                    finalGpsUpdate.push(updateForGPS);
                }
            })/*.then(
         function () {
         //var upd = {"gps_logs":{"$insert" : finalInsert}}
         return saveDataToGpsLog(finalInsert);
         // .fail(function(err){
         //     console.log("err in upd.....",err)
         // })
         }).then(
         function () {

         return saveDataToGps(finalGpsUpdate);
         // .fail(function(err){
         //     console.log("err in upd.....",err)
         // })
         })*/.then(
            function () {
                return saveDataInMongo(finalInsert, "gps_logs");
            }).then(
            function () {
                return saveDataInMongo(finalGpsUpdate, "trucks");
            }).then(function () {
            // }).then(function () {
            //     if(data && data.length>0) {
            //         var vehicleimei =data[0].imei;
            //         var devicedate =data[0].device_time;
            //         if(sendAlert && vehicleimei && finalGpsUpdate && finalGpsUpdate.length>0 &&  finalGpsUpdate[0].hasOwnProperty('powercut')){
            //             sendNotification(finalGpsUpdate,vehicleimei,devicedate)
            //
            //         }
            //     }

        }).fail(function (err) {
            console.log("err >> >> " + err.message)
            console.log("err stack>> >> " + err.stack)
        })
    }

}

exports.emitCapturedData = function (dataToSend, imeiData, connection) {
    if (dataToSend) {
        var serverData = {};
        for (var k in dataToSend) {
            serverData[k] = dataToSend[k]
        }
        var receiver = dataToSend.receiver;
        var sender = dataToSend.sender;
        var historyData = dataToSend.history_data && dataToSend.history_data == true ? true : false;
        var marked_time = undefined;
        if (!historyData) {
            if (imeiData[sender]) {
                serverData.last_data = imeiData[sender].data;
                marked_time = imeiData[sender].marked_time;
            }
            imeiData[sender].data = dataToSend;
            var markedInterval = 300000;
            if (!marked_time || (new Date() - marked_time) > markedInterval) {
                marked_time = new Date();
                serverData.marked = true;
            }
            imeiData[sender].marked_time = marked_time;
        }
        imeiDataTemp=imeiData;
        serverData.history_data=historyData;
        serverData.isnewtrack = imeiData[sender].isnewtrack|| null;
        serverData.remote_address = connection.remoteAddress + ":" + connection.remotePort;
        self.saveData([serverData], imeiData)
    }
}


function iterate(array, Q, task) {
    var D = Q.defer();
    var length = array ? array.length : 0;
    if (length == 0) {
        D.resolve();
        return D.promise;
    }
    var index = 0;

    function loop(index) {
        try {
            var onResolve = function () {
                index = index + 1;
                if (index == array.length) {
                    D.resolve();
                } else {
                    loop(index);
                }
            }
            try {
                var p = task(index, array[index]);
                if (!p) {
                    onResolve();
                    return;
                }
                p.then(onResolve)
                    .fail(function (err) {
                        D.reject(err);
                    })
            } catch (e) {
                D.reject(e);
            }
        } catch (e) {
            D.reject(e);
        }
    }

    loop(index);
    return D.promise;
}

function sendNotification(finalGpsUpdate,vehicleimei,devicedate) {
    // console.log("finalGpsUpdate>>>>>"+JSON.stringify(finalGpsUpdate))
    // console.log("vehicleimei>>>>>"+JSON.stringify(vehicleimei))
    var options = {};
    var date=new Date();
    var totalminutes=(date.getHours()*60)+(date.getMinutes())+330;
    var hours=Number(totalminutes/60).toFixed(0);
    var minutes=totalminutes % 60
    var StringDate = "" + date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + "  " + hours + ":" +minutes
    options.to = ["sushil.nagvan@daffodilsw.com"];
    options.subject = "Power "+finalGpsUpdate[0].powercut + " Notification for vehicle "+vehicleimei;
    options.text = "Device "+vehicleimei + " is powered  "+finalGpsUpdate[0].powercut +" at "+StringDate
    var transport = nodemailer.createTransport({auth: {user: "feedback-noreply@daffodilsw.com", pass: "074714018160"}, service: "gmail"});
    // transport.sendMail(options, function (err, info) {
    //     if (err) {
    //         // d.reject(err);
    //         // return;
    //         console.log("mail error>>>>"+err.stack)
    //
    //     }
    // });

    // sendMailFromSendGrid(options)

}

function sendMailFromSendGrid(trackInfo){
    var APP_SENDGRID_KEY = "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";
    if (APP_SENDGRID_KEY) {
        var newOptions = {
            "personalizations": [
                {
                    "to": [
                        {
                            "email": "sushil.nagvan@daffodilsw.com"
                        },
                        // {
                        //     "email": "harpreet.singh@applane.com"
                        // },
                        {
                            "email": "amit@daffodilsw.com"
                        }
                    ],
                    "subject": trackInfo.subject
                }
            ],
            "from": {
                "email": "developer@daffodilsw.com"
            },
            "content": [
                {
                    "type": "text/plain",
                    "value": trackInfo.text
                }
            ]
        };
        try {
            var sendgrid = require('sendgrid')(APP_SENDGRID_KEY);
            var request = sendgrid.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: newOptions
            });

            sendgrid.API(request, function (error, response) {
                if (error) {
                    console.log("Err>>>>>>>>>>>", error);
                }
                return;
            });
        } catch (err) {
            throw err;
        }
    } else {
        throw new Error("Credential not Found");
    }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function saveDataToGpsLog(update) {
    // console.log("update GPS logs>>>>>>>>>>>>>"+JSON.stringify(update))
    //ff95c15564dd327ae4334098cdc54eebc1bd72b3 main token
    var serviceDetail = {
        "hostname":"react.autoload.applane.com",
        "port":80,
        path:"/rest/update/gps_logs",
        "method":"POST"
    };
    // var serviceDetail = {"hostname": "192.168.100.117", "port": 5000, path: "/rest/update/gps_logs", "method": "POST"};
    var updates = {$insert:JSON.stringify(update), token:"ff95c15564dd327ae4334098cdc54eebc1bd72b3"};
    return executeService(serviceDetail, updates).then(function (doneRes) {
    })
}

function saveDataToGps(update) {
    // console.log("update GPS>>>>>>>>>>>>>"+JSON.stringify(update))
    var serviceDetail = {
        "hostname":"react.autoload.applane.com",
        "port":80,
        path:"/rest/update/gps",
        "method":"POST"
    };
    // var serviceDetail = {"hostname": "192.168.100.117", "port":5000, path: "/rest/update/gps", "method": "POST"};
    var updates = {
        $update:JSON.stringify(update),
        enableLogs:false,
        token:"ff95c15564dd327ae4334098cdc54eebc1bd72b3"
    };
    return executeService(serviceDetail, updates).then(function (doneRes) {
    })
}

function saveDataInMongo(updates, table) {
    return getDB("autoload_new", table).then(
        function (db) {
            return iterate(updates, Q, function (index, row) {
                var d = Q.defer();
                if (table === "gps_logs") {
                    config.serverload.signalSendToProccess = config.serverload.signalSendToProccess + 1;
                    var signalId= config.serverload.signalSendToProccess;
                    config.serverload.pendingSignals[signalId] = row;

                    db.collection(table).insertOne(row, {w:1}, function (err, result) {
                        if (err) {
                            config.serverload.signalProcesedErr++;
                            config.serverload.errors[signalId] = err.message;
                            d.reject(err);
                            return;
                        }
                        config.serverload.signalProcesed++;
                        delete config.serverload.pendingSignals[signalId];
                        d.resolve(result);
                    });
                } else if (table === "trucks") {
                    var rowId = row._id;
                    if (typeof rowId === "string") {
                        rowId = objectID(rowId);
                    }
                    var query = {_id:rowId};
                    delete row._id;
                    db.collection(table).update(query, {$set:row}, {w:1}, function (err, result) {
                        if (err) {
                            d.reject(err);
                            return;
                        }
                        d.resolve(result);
                    });
                } else {
                    d.resolve();
                }
                return d.promise;
            })
        })
}

function getDB(dbName, table) {
    var key = dbName + "_" + table;
    if (DBS[key]) {
        var d = Q.defer();
        d.resolve(DBS[key]);
        return d.promise;
    }
    var url = "mongodb://139.162.25.190:28853/" + dbName;
    return connectToMongo(url).then(function (db) {
        DBS[key] = db;
        return db;
    })
}

function connectToMongo(url) {
    var MongoClient = require("mongodb").MongoClient;
    var d = Q.defer();
    MongoClient.connect(url, function (err, db) {
        if (err) {
            d.reject(err);
            return;
        }
        db.on("timeout", function(){
            DBS ={};
        })
        db.on("close", function(){
            DBS ={};
        })
        db.authenticate("autoload@admin", "daffodil-autoload@admin", {authdb:"admin"}, function (err, res) {
            if (err) {
                d.reject(err);
            } else if (!res) {
                d.reject(new Error("Auth fails"));
            } else {
                d.resolve(db);
            }
        })
    });
    return d.promise;
}

function executeService(service, params) {
    var Q = require("q");
    var d = Q.defer();
    var path = service.path;
    var queryString = "";
    if (Object.keys(params).length > 0) {
        queryString = QueryString.stringify(params);
    }
    var serverOptions = {
        hostname:service.hostname,
        port:service.port,
        path:path,
        method:service.method,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Content-Length':queryString.length
        }
    };
    config.serverload.signalSendToProccess++;
    var req = http.request(serverOptions, function (res) {
        if (params.response) {
            res.setEncoding('binary');
        } else {
            res.setEncoding('utf8');
        }
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            config.serverload.signalProcesed++;
            d.resolve(body);
        });
    });
    req.on('error', function (err) {
        config.serverload.signalProcesedErr++;
        d.reject(err);
    });
    req.write(queryString);
    req.end();
    return d.promise;
}

function notifySocket(params) {
    // console.log("param>>>"+JSON.stringify(params))
    var Q = require("q");
    var d = Q.defer();
    var http = require("http");

    var serverOptions = {
        hostname: "139.162.56.61",
        port: 6200,
        path: "/rest/saveDataManual?data=" +JSON.stringify(params),
        method: "get",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'

        }
    };
    try {
        var req = http.request(serverOptions, function (res) {
            //res.setEncoding('gzip');
            var data = ''
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                // console.log('isnewtrack result..' + data);
                d.resolve(data)
            })
        });


        req.on('error', function (e) {
            console.log("isnewtrack error..........." + e.stack);
            console.error(e);
            d.reject(e)
        });


        req.end();
        return d.promise;

    } catch (e) {
        console.log("error ctch ", e);
    }

}