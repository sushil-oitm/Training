import {populateDottedFields} from "./Utility";

var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectID;

class MongoConnect {
    constructor({config}) {
        this.config = config;
        this.dbs = {};
    }

    connectDB() {
        return new Promise((resolve, reject) => {
            const {host, port, dbName, authEnabled, user, pwd, authDB} = this.config;
            let url = "mongodb://" + host + ":" + port + "/" + dbName;
            if (this.dbs[dbName]) {
                resolve(this.dbs[dbName]);
                return;
            }
            MongoClient.connect(url, (err, db) => {
                if (err) {
                    console.log("Error in connect to db", err);
                    reject(err);
                    return;
                }
                db.on("timeout", (error, db) => {
                    delete this.dbs[dbName];
                });
                db.on("close", _ => {
                    delete this.dbs[dbName];
                });
                if (authEnabled) {
                    try {
                        db.authenticate(user, pwd, {authdb: authDB}, (err, res) => {
                            if (err) {
                                reject(err);
                            } else if (!res) {
                                reject(new Error("DB Authentication Failed"));
                            } else {
                                this.dbs[dbName] = db;
                                resolve(db);
                            }
                        });
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    // console.log("success")
                    this.dbs[dbName] = db;
                    resolve(db);
                }
            });
        });
    }

    update(table, filter, update, options = {}) {
        for (let i in filter) {
            if (i == "_id" && "string" == typeof filter._id) {
                filter._id = ObjectId(filter._id)
            }
        }
        return new Promise((resolve, reject) => {
            this.connectDB()
                .then(mongoDB => {
                    mongoDB.collection(table).update(filter, update, options, function (err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                })
                .catch(e => reject(e));
        });
    }

    find(table, query, option) {
        // console.log("mongo find called :")
        let {filter, fields, ...restOptions} = query;
        fields = populateDottedFields({...fields});
        // console.log("filter>>>>>>",filter)
        // console.log("fields>>>>>>",fields)
        // console.log("table>>>>>>",table)
        // for(let i in filter) {
        //    console.log("type of>>>>"+typeof i)
        // }
        for (let i in filter) {
            if (i == "_id" && "string" == typeof filter._id) {
                filter._id = ObjectId(filter._id)
            }
        }
        return new Promise((resolve, reject) => {
            this.connectDB()
                .then(mongoDB => {
                    mongoDB.collection(table).find(filter, {fields, ...restOptions, ...option}).toArray((err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        // console.log("mongo result is>>>>"+JSON.stringify(result))
                        resolve({result});
                    });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    insert(table, insert, options = {}) {
        // console.log("mongo insert called")
        return new Promise((resolve, reject) => {
            this.connectDB()
                .then(mongoDB => {
                    // console.log("mongo mongoDB called")
                    const newValue = {...insert};
                    mongoDB.collection(table).insertOne(newValue, options, function (err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                result: result.ops[0]
                            });
                        }
                    });
                })
                .catch(e => reject(e));
        });
    }

    insertMany(table, insert, options = {}) {
        return new Promise((resolve, reject) => {
            this.connectDB()
                .then(mongoDB => {
                    mongoDB.collection(table).insertMany(insert, options, function (err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                result: result.insertedIds
                            });
                        }
                    });
                })
                .catch(e => reject(e));
        });
    }

    remove(table, filter) {
        // console.log("Mongo >>> remove >>> Table>>>>>", table, ">>>filter>>>>>", filter);
        for (let i in filter) {
            if (i == "_id" && "string" == typeof filter._id) {
                filter._id = ObjectId(filter._id)
            }
        }
        return new Promise((resolve, reject) => {
            const options = {w: 1};
            this.connectDB()
                .then(mongoDB => {
                    mongoDB.collection(table).removeOne(filter, options, function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result.result || result);
                    });
                })
                .catch(e => reject(e));
        });
    }

}


export default MongoConnect;
