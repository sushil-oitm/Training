import http from "http";
import express from "express";
import {configure} from "./Http"
import MongoConnect from "./MogoConnect"
import {getCLAs} from "./Utility";
var app = express();

var server = http.Server(app);
let connection={
    host: "192.168.100.119",
    port: 27017,
    authEnabled:false,
    dbName: "autoload"
}

let mongoConnect=new MongoConnect({config:connection});
var context = {};
context = getCLAs(context);
const PORT = context.PORT;
configure(app, {
    mongoConnect,
    context
})
    .then(_ => {
        server.listen(PORT, () => console.log(`>> Server is now running on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.log("err in start server>>>>>>>>>>>>", err);
    });





