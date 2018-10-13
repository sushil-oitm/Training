import http from "http";
import express from "express";
import * as Utility from "./Utility";
import MongoConnect from "./MogoConnect"
import TransactionConnect from "./TransactionConnect"
import {testTransaction} from "./Transaction";
var ObjectId = require("mongodb").ObjectID;
let connection={
    host: "127.0.0.1",
    port: 27017,
    authEnabled:false,
    dbName: "test1",
    fileDBName: "files_db",
    logDBName: "app_v3_logs"
}
// testTransaction(connection)
let mongoConnect=new MongoConnect({config:connection});
let TransactionDB=new TransactionConnect(mongoConnect);
 let TransactionDB2=new TransactionConnect(mongoConnect);

let getPromise =()=>{
    return new Promise((resolve,reject)=>{
        resolve();
    })
}

// getPromise().then(()=>{
//     return TransactionDB.insert("student",{name:"sushil"})
// }).then(()=>{
//     return TransactionDB.insert("student_1",{name:"jyoti"})
// }).then(()=>{
//    return  TransactionDB.commit()
// })

getPromise().then(()=>{
    // return TransactionDB2.update("student",{_id:ObjectId("5bae1300fe7ea02ca5c1b3ab")},{$set:{name:"sushil_1"}},{},{old:{ "_id" : ObjectId("5bae1300fe7ea02ca5c1b3ab"), "name" : "sushil"}})
}).then(()=>{
      let updateStudent2=TransactionDB2.update("student_1",{_id:ObjectId("5bae1301fe7ea02ca5c1b3ad")},{$set:{name:"JYT"}},{},{old:{ "_id" : ObjectId("5bae1301fe7ea02ca5c1b3ad"), "name" : "jyoti" }})
}).then(()=>{
   return  TransactionDB2.commit()
})


// var context = {};
//  context = Utility.getCLAs(context);
//
// const PORT = context.PORT || 5100;
//
// var app = express();
//
// var server = http.Server(app);
//
// server.listen(PORT, (err) => {
//     if (err) {
//         return console.log('something bad happened', err)
//     }
//
//     console.log(`server is listening on ${PORT}`)
// })




