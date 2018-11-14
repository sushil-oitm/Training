import {populateDottedFields} from "./Utility";
import {isJSONObject} from "../../../../manaze-store/src/rhs-common/PureFunctions";

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

    update(table, filter, update,subModelChanges, options = {}) {
        for (let i in filter) {
            if (i == "_id" && "string" == typeof filter._id) {
                filter._id = ObjectId(filter._id)
            }
        }
        let pendingChanges = null;
        let pendingPulls = null;
        let modifiedUpdates=update;
        if (subModelChanges) {
            for (var k in subModelChanges) {
                const changes = subModelChanges[k];
                let consumed = false;
                if (changes.insert) {
                    const nestedArray = changes.insert.map(nestedInsert => {
                        return { ...nestedInsert,_id:ObjectId() };
                    });
                    if (nestedArray.length) {
                        modifiedUpdates["$push"] = modifiedUpdates["$push"] || {};
                        modifiedUpdates["$push"][k] = {};
                        modifiedUpdates["$push"][k]["$each"] = nestedArray;
                        consumed = true;
                    }
                }
                if (changes.remove) {
                    const nestedArray = changes.remove.map(nestedRemove => {
                        return ObjectId(nestedRemove._id);
                    });
                    if (nestedArray.length) {
                        const pull = { _id: { $in: nestedArray } };
                        if (consumed) {
                            pendingPulls = pendingPulls || {};
                            pendingPulls[k] = pull;
                        } else {
                            modifiedUpdates = modifiedUpdates || {};
                            modifiedUpdates["$pull"] = modifiedUpdates["$pull"] || {};
                            modifiedUpdates["$pull"][k] = pull;
                            consumed = true;
                        }
                    }
                }
                if (changes.update) {
                    pendingChanges = pendingChanges || [];
                    changes.update.forEach(nestedUpdate => {
                        const nestedFilter = { [`${k}._id`]: ObjectId(nestedUpdate._id), ...filter };
                        let nestedUpdates = {};
                        for (var j in nestedUpdate.changes) {
                            var value = nestedUpdate.changes[j];
                            let nestedKey = `${k}.$.${j}`;
                            if (value === null || value === void 0) {
                                nestedUpdates.$unset = nestedUpdates.$unset || {};
                                nestedUpdates.$unset[nestedKey] = "";
                            } else {
                                nestedUpdates.$set = nestedUpdates.$set || {};
                                nestedUpdates.$set[nestedKey] = value;
                            }
                        }
                        if (getNullOrObject(nestedUpdates)) {
                            pendingChanges.push({
                                filter: nestedFilter,
                                updates: nestedUpdates
                            });
                        }
                    });
                }
            }
        }
        // console.log("modifiedUpdates>>>>>>"+JSON.stringify(modifiedUpdates))
        // console.log("pendingPulls>>>>>>"+JSON.stringify(pendingPulls))
        // console.log("pendingChanges>>>>>>"+JSON.stringify(pendingChanges))
        return new Promise((resolve, reject) => {
            this.connectDB()
                .then(mongoDB => {
                    mongoDB.collection(table).update(filter, modifiedUpdates, options, function (err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            if (pendingPulls || pendingChanges) {
                                return runPendingPulls(mongoDB, table, filter, pendingPulls, options)
                                    .then(() => {
                                        if (pendingChanges) {
                                            return runPendingUpdates(mongoDB, table, pendingChanges, options);
                                        }
                                    })
                                    .then(() => {
                                        resolve({ result: result });
                                    });
                            }
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
         // console.log("option>>>>>>",option)
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

    insert(table, insert,subModelChanges={}, options = {}) {
        // console.log("mongo insert called")
        return new Promise((resolve, reject) => {
            this.connectDB()
                .then(mongoDB => {
                    // console.log("mongo mongoDB called")
                    const newValue = {...insert};
                    if (subModelChanges) {
                        for (var k in subModelChanges) {
                            const changes = subModelChanges[k];
                            if (changes && changes.insert) {
                                const nestedArray = changes.insert.map(nestedInsert => {
                                    return { ...nestedInsert,_id:ObjectId() };
                                });
                                newValue[k] = nestedArray;
                            }
                        }
                    }
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

const runPendingPulls = (mongoDB, table, filter, pendingPulls, options) => {
    return new Promise((resolve, reject) => {
        {
            if (!pendingPulls) {
                resolve();
                return;
            }
            mongoDB.collection(table).update(filter, { $pull: pendingPulls }, options, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        }
    });
};
const runPendingUpdates = (mongoDB, table, [first, ...rest], options) => {
    return new Promise((resolve, reject) => {
        {
            mongoDB.collection(table).update(first.filter, first.updates, options, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        }
    }).then(() => {
        if (rest && rest.length > 0) {
            return runPendingUpdates(mongoDB, table, rest, options);
        }
    });
};
const getNullOrObject = value => {
    if (isJSONObject(value) && Object.keys(value).length) {
        return value;
    } else {
        return null;
    }
};

export default MongoConnect;
