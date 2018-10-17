var ObjectId = require("mongodb").ObjectID;
import {deepEqual,resolveValue,isJSONObject} from "./Utility";
import allMethod from "./SystemMethod"
export default class Transaction {
    constructor(db, txid, { logger, port, mailConfig, context } = {}) {
        this._db = db;
        this.txid = txid || new ObjectId();
        this.txEnabled = true;
        this.logger = logger;
        this.port = port;
        this.mailConfig = mailConfig;
        this.context = context;
        // console.log("context>>>>"+JSON.stringify(context))
    }
    aggregate(table, query) {
        return this._db.aggregate(table, query, { logger: this.logger }).then(res => {
            return res;
        });
    }
    find(table, query,option) {
        return this._db.find(table, query, { ...option,logger: this.logger }).then(res => {
            return res;
        });
    }

    insert(table, insert, subModelChanges, options, { skipTx } = {}) {
        return beforeInsert(
            { table, insert, subModelChanges, txid: this.txid, port: this.port, skipTx },
            this._db
        ).then(_ => {
            return this._db.insert(table, insert, subModelChanges, options, { logger: this.logger }).then(result => {
                return result;
            });
        });
    }

    remove(table, filter, options = {}, { skipTx } = {}) {
        return beforeDelete(
            { ...options, table, txid: this.txid, port: this.port, skipTx, status: this.status },
            this._db
        ).then(_ => {
            return this._db.remove(table, filter).then(result => {
                return result;
            });
        });
    }

     update(table, filter, update, subModelChanges, options = {}, { skipTx } = {}) {
        return beforeUpdate(
            { ...options, update, subModelChanges, filter, table, txid: this.txid, port: this.port, skipTx },
            this._db
        ).then(_ => {
            return this._db.update(table, filter, update, subModelChanges, options, { logger: this.logger }).then(result => {
                return result;
            });
        });
    }

    invoke(methodName, methodParams, args) {
    return allMethod[methodName](methodParams,args)
    }

    async commit() {
        if (!this.txid) {
            throw new Error("Transaction id is mandatory");
        }
        await commitTransaction(this);
        console.log("commit successfully")

        // delete this.txid;
    }

    async rollback(dbConnect) {
        if (!this.txid) {
            throw new Error("Transaction id is mandatory");
        }
        await handleRollback(this, dbConnect);
        console.log("rollback successfully")
        // delete this.txid;
    }
     getTxId = () => {
        return this.txid;
    };

    getDB = () => {
        return this._db;
    };

    setTxInfo = info => {
        var txId = this.txid;
        if (txId) {
            this.txInfo = this.txInfo || {};
            this.txInfo[txId] = this.txInfo[txId] || [];
            this.txInfo[txId].push(info);
        }
    };
}


const beforeInsert = async ({ table, insert, txid, port, skipTx }, db) => {
    if (!txid) {
        throw new Error("Transaction id is mandatory");
    }
    if (skipTx) {
        return new Promise(res => res());
    }
    let _id = insert._id;
    if (!_id || (typeof _id == "string" && _id.indexOf("new_") == 0)) {
        _id = new ObjectId();
        insert._id = _id;
    }
    insert.__txs__ = {
        [txid]: {}
    };
    var TxInsert = {
        tx: { collection: table, delete: { _id: _id } },
        status: "Pending",
        txid,
        port,
        createdDate: new Date()
    };
    // console.log("TxInsert>>>>>>"+JSON.stringify(TxInsert))
    return await insertTransactionDetails(db, TxInsert);
};

const beforeDelete = async ({ table, old, filter, txid, port, skipTx }, db) => {
    if (!txid) {
        throw new Error("Transaction id is mandatory");
    }
    if (skipTx) {
        return new Promise(res => res());
    }
    // console.log("old>>>>>>"+JSON.stringify(old));
    var txInsert = {
        tx: { collection: table, insert: old },
        status: "Pending",
        txid,
        port,
        createdDate: new Date()
    };
    return await insertTransactionDetails(db, txInsert);
};

const beforeUpdate = async ({ update, old, filter, subModelChanges, table, txid, port, skipTx }, db) => {
    // console.log("beforeUpdate called>>>>>")
    if (!txid) {
        throw new Error("Transaction id is mandatory");
    }
    if (skipTx) {
        return new Promise(res => res());
    }
    var recordId = filter._id;
    var isUpdateRequired = true;
    var alreadyInProgress = false;

    let data = await getTransactions({ filter: { txid, "tx.collection": table } }, db);
    data = data && data.result;

    for (var i = 0; i < data.length; i++) {
        // checking is the update executing on the same record insert, delete in the same transaction.
        var transaction = data[i];
        if (
            (transaction.tx.insert && deepEqual(transaction.tx.insert._id, recordId)) ||
            (data[i].tx.delete && deepEqual(data[i].tx.delete._id, recordId))
        ) {
            isUpdateRequired = false;
        } else if (transaction.tx.update && deepEqual(transaction.tx.update._id, recordId)) {
            // true i.e. updated the same record in a transaction again so no need the entry in transaction table.
            alreadyInProgress = true;
        }
    }
    if (isUpdateRequired && !alreadyInProgress) {
        // console.log("isUpdateRequired called>>>>>")
        var txInsert = {
            tx: { collection: table, update: { _id: recordId } },
            status: "Pending",
            txid,
            port,
            createdDate: new Date()
        };
        // console.log("isUpdateRequired called>>>>>"+JSON.stringify(txInsert))
        await insertTransactionDetails(db, txInsert);
    }

    if (isUpdateRequired) {
        updateDocument({ txid, update, old, subModelChanges, recordId });
    }
    // console.log("out from update transaction>>>>>>>>>>>>>>>>>>>")
};

function updateDocument({ txid, update, old, subModelChanges, recordId }) {
    // console.log("updateDocument called>>>>>")
    old = old || {};
    var previousTransaction = old["__txs__"] || {};

    var pTx = previousTransaction[txid];
    if (pTx !== void 0) {
        pTx = pTx.tx || {};
    } else {
        pTx = { _id: recordId, array: [] };
    }
    updateTransaction(pTx, update, subModelChanges, old);

    update.$set = update.$set || {};
    update.$set[`__txs__.${txid}`] = { tx: pTx };
}

function updateTransaction(tx, updates, subModelChanges, old) {
    // console.log("updateTransaction called>>>>>")
    let { $set, $unset, $inc } = updates;

    for (let updatedField in $set) {
        if (updatedField === "__txs__") {
            continue;
        }
        handleSet(tx, { field: updatedField, data: $set, old });
    }

    for (let updatedField in $unset) {
        if (updatedField === "__txs__") {
            continue;
        }
        handleSet(tx, { field: updatedField, data: $unset, old });
    }

    for (let updatedField in $inc) {
        if (updatedField === "__txs__") {
            continue;
        }
        handleInc(tx, { field: updatedField, data: $inc, old });
    }
    // handleArrayDataValues(tx.array, subModelChanges, old);
}

// function handleArrayDataValues(array, subModelChanges, old) {
//     if (subModelChanges) {
//         for (var field in subModelChanges) {
//             const changes = subModelChanges[field];
//             var oldValues = old[field];
//             if (Array.isArray(changes) || !isJSONObject(changes)) {
//                 throw new Error(`Transaction for value ${JSON.stringify(changes)} is not handled`);
//             }
//
//             if (changes.insert) {
//                 const nestedArray = changes.insert.map(nestedInsert => {
//                     let nestedId = nestedInsert._id;
//                     if (!nestedId || (typeof nestedId == "string" && nestedId.indexOf("new_") == 0)) {
//                         nestedId = new ObjectId();
//                     }
//                     var exists = matchedIndex(array, { _id: nestedId }, "_id");
//                     var actualNestedValue = { ...nestedInsert, _id: nestedId };
//                     if (exists === void 0) {
//                         array.push({ _id: nestedId, type: "delete", field, uniqueId: new ObjectId() });
//                     }
//                     return actualNestedValue;
//                 });
//                 changes.insert = nestedArray;
//             }
//
//             let oldValuesMap = (oldValues &&
//                 oldValues.reduce((prev, value) => {
//                     prev[value._id] = value;
//                     return prev;
//                 }, {})) || {};
//
//             if (changes.remove) {
//                 const nestedArray = changes.remove.map(nestedRemove => {
//                     var documentId = nestedRemove._id;
//                     var exists = matchedIndex(array, { _id: documentId }, "_id");
//                     if (exists === void 0) {
//                         array.push({
//                             _id: documentId,
//                             type: "insert",
//                             field: field,
//                             value: oldValuesMap[documentId],
//                             uniqueId: new ObjectId()
//                         });
//                     } else {
//                         array.unshift({
//                             _id: documentId,
//                             type: "insert",
//                             field: field,
//                             value: oldValuesMap[documentId],
//                             uniqueId: new ObjectId()
//                         });
//                     }
//
//                     return nestedRemove._id;
//                 });
//             }
//
//             if (changes.update) {
//                 changes.update.forEach(nestedUpdate => {
//                     var documentId = nestedUpdate._id;
//                     var exists = matchedIndex(array, { _id: documentId }, "_id");
//                     if (exists === void 0) {
//                         var updates = {
//                             _id: documentId,
//                             field,
//                             type: "update",
//                             uniqueId: new ObjectId()
//                         };
//                         array.push(updates);
//                         var oldValues = oldValuesMap[documentId];
//                         handleArrayUpdates(nestedUpdate.changes, updates, oldValues);
//                     } else {
//                         var oldTransactionUpdate = array[exists];
//                         if (oldTransactionUpdate.type === "update") {
//                             var oldValues = oldValuesMap[documentId];
//                             handleArrayUpdates(nestedUpdate.changes, oldTransactionUpdate, oldValues);
//                         }
//                     }
//                 });
//             }
//         }
//     }
// }
//
// var handleArrayUpdates = (changes, arrayUpdate, old) => {
//     for (var field in changes) {
//         var value = changes[field];
//         handleSet(arrayUpdate, { field: field, data: value, old });
//     }
// };

function handleInc(tx, { field, data, old }) {
    tx.inc = tx.inc || [];
    if (isParentModifiedInSameTx(tx.set, field) === void 0) {
        let index = isParentModifiedInSameTx(tx.inc, field);
        var value = data[field];
        if (index !== void 0) {
            var oldValue = tx.inc[index].value;
            tx.inc[index].value = oldValue + -1 * value;
        } else {
            tx.inc.push({ key: field, value: -1 * value });
        }
    }
}

var handleSet = (tx, { field, data, old }) => {
    tx.set = tx.set || [];
    if (isParentModifiedInSameTx(tx.set, field) === void 0) {
        var oldValue = resolveValue(old, field);
        if (oldValue === void 0 || oldValue === null) {
            if (isChildModifiedInSameTx(tx.set, field) === void 0) {
                if (resolveValue(data, field) !== null) {
                    tx.set.push({ key: field, value: null });
                }
            }
        } else {
            if (isJSONObject(oldValue)) {
                for (var key in oldValue) {
                    handleSet(tx, { field: field + "." + key, data, old });
                }
            } else {
                tx.set.push({ key: field, value: oldValue });
            }
        }
    }
};

function isParentModifiedInSameTx(txValue, newKey) {
    if (!txValue || !txValue.length) {
        return;
    }
    for (var j = 0; j < txValue.length; j++) {
        //check - is any update is saved for parent field of object .. if yes then skip child updates...
        if (txValue[j].key === newKey || newKey.indexOf(txValue[j].key + ".") === 0) {
            return j;
        }
    }
}

function isChildModifiedInSameTx(txValue, newKey) {
    if (!txValue || !txValue.length) {
        return;
    }
    for (var j = 0; j < txValue.length; j++) {
        if (txValue[j].key.indexOf(newKey + ".") === 0) {
            return j;
        }
    }
    return;
}

const commitTransaction = async transactionInstance => {
    var txid = transactionInstance.getTxId();
    var db = transactionInstance.getDB();
    // console.log("txid>>>>>",txid)
    let transactionsss = await getTransactions({ filter: {txid } }, db);
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    // console.log("transactionsss pre>>>>>>"+JSON.stringify(transactionsss))
    await db.update("TXS", { txid: txid }, { $set: { status: "Commiting" } },{ multi: true });
    await db.remove("TXS", { txid: txid, status: "Commiting", "tx.insert": { $exists: true } });
    let transactions = await getTransactions({ filter: { status: "Commiting", txid } }, db);
    // console.log("transactions>>>>>>"+JSON.stringify(transactions))
    transactions = transactions && transactions.result;
    for (let i = 0; i < transactions.length; i++) {
        let { _id, tx } = transactions[i];
        if (tx.update !== void 0) {
            await removeTxsFromRecord(
                {
                    txid,
                    table: tx.collection,
                    filter: { _id: tx.update._id }
                },
                db
            );
        } else if (tx.delete !== void 0) {
            await removeTxsFromRecord(
                {
                    txid,
                    table: tx.collection,
                    filter: { _id: tx.delete._id }
                },
                db
            );
        }
        await deleteTransaction(_id, db);
    }
};

const getTransactions = ({ table, filter, ...rest }, db) => {
    return db.find("TXS", { filter, sort: { _id: -1 }, fields: { _id: 1, tx: 1, db: 1 }, ...rest });
};

async function deleteTransaction(recordId, db) {
    return db.remove("TXS", { _id: recordId });
}

const removeTxsFromRecord = ({ txid, table, filter }, db) => {
    return db.update(table, filter, { $unset: { ["__txs__." + txid]: "" } });
};

const insertTransactionDetails = (db, TxInsert) => {
    return db.insert("TXS", TxInsert);
};

const handleRollback = async (transactionInstance, dbConnect, previousTransaction) => {
    var txid = transactionInstance.getTxId();
    var db = transactionInstance.getDB();

    let transactions = await getTransactions({ filter: { txid }, limit: 1 }, db);
    transactions = transactions && transactions.result;

    let transaction = transactions && transactions.length > 0 ? transactions[0] : void 0;

    if (transaction && transaction.tx) {
        /*
             * process each operation in the transaction on by one
             * if no updated are found then delete the complete transaction
             * */
        if (deepEqual(transaction._id, previousTransaction)) {
            /*case when _id is updated
                   * testcase -- Update in object multiple FK then rollback
                   * */
            var err = new Error(
                "Unable to rollback as count is not getting decrementing in updates array >>>" + JSON.stringify(transaction)
            );
            sendMailforErrorInRollBack(err, transaction, dbConnect, transactionInstance.mailConfig);
            throw err;
        }
        return processRollbackUpdates(transactionInstance, transaction, { txid, db }, dbConnect)
            .then(function() {
                return deleteTransaction(transaction._id, db);
            })
            .then(function() {
                return handleRollback(transactionInstance, dbConnect, transaction._id);
            })
            .catch(err => {
                sendMailforErrorInRollBack(err, transaction, dbConnect, transactionInstance.mailConfig);
                throw err;
            });
    }
};

function processRollbackUpdates(transactionInstance, data, { txid, db }, dbConnect) {
    /*
       * if the operation in transaction is insert or delete then rollback from the transaction
       * otherwise rollback from the document
       * */
    var { tx } = data;
    if (tx) {
        var collection = tx.collection;
        /*manage info for sending mail on server restart rollback @sunil - 08/3/18*/
        var txInfo = {
            status: "rollback",
            type: collection,
            info: tx
        };
        transactionInstance.setTxInfo(txInfo);
        if (tx.insert !== void 0) {
            /*let a record is deleting -- then its insert txs will be saved -- but error in delete and txs try to rollback
                   * and insert the same record again then duplicate error will be throw by mongo.*/
            try {
                return db.insert(collection, tx.insert);
            } catch (err) {
                if (err.code !== 11000) {
                    throw err;
                }
            }
        } else if (tx.delete !== void 0) {
            return db.remove(collection, { _id: tx.delete._id, [`__txs__.${txid}`]: { $exists: true } });
        } else if (tx.update !== void 0 && tx.type == "sequence") {
            var sequenceFilter = tx.update.filter;
            var filter = {
                [tx.updateField]: tx.update.number,
                _id: tx.update._id,
                ...sequenceFilter
            };
            return db.update(collection, filter, { $inc: { [tx.updateField]: -1 } });
        } else {
            return rollbackFromRecord(
                data._id,
                tx,
                collection,
                undefined,
                db,
                txid,
                txInfo,
                dbConnect,
                transactionInstance.mailConfig
            );
        }
    }
}

async function rollbackFromRecord(_id, tx, collection, initialArrayCount, db, txid, txInfo, dbConnect, mailConfig) {
    var updates = tx.update;

    let data = await db.find(collection, { filter: { _id: updates._id }, fields: { __txs__: 1 } });
    data = data && data.result;
    if (!data || !data.length) {
        return;
    }

    var transactions = data[0].__txs__ || {};
    var txToRollback = transactions[txid] ? transactions[txid]["tx"] : void 0;
    if (txToRollback) {
        if (txInfo) {
            txInfo.info.update.__txs__ = txToRollback;
        }
        var id = txToRollback._id;
        var array = txToRollback.array; //submodel array records
        if (array && array.length > 0) {
            //TODO array handling..

            if (array.length == initialArrayCount) {
                throw new Error(
                    "Unable to rollback array updates in record as array count is not getting decrementing in updates array >>>" +
                    JSON.stringify(array)
                );
            }
            await handleArrayRollback({ tx: array[0], id, txid, collection, db });

            await rollbackFromRecord(_id, tx, collection, array.length, db, txid, txInfo, dbConnect, mailConfig);
        } else {
            var newUpdate = {
                $unset: {
                    ["__txs__." + txid]: null
                }
            };
            await rollbackTopLevelFields(collection, txToRollback, newUpdate, db, dbConnect, mailConfig);
        }
    }
}

/**
 * This function will rollback first record of array and will pull from the array so next will first for the same
 * @param tx
 * @param recordId
 * @param txid
 * @param collection
 * @param db
 * @returns {Promise}
 */
function handleArrayRollback({ tx, id: recordId, txid, collection, db }) {
    var type = tx.type;
    if (type === "insert") {
        return handleInsertOperationRollback({ tx, txid, recordId, collection, db });
    } else if (type === "delete") {
        return handleDeleteOperationRollback({ tx, txid, recordId, collection, db });
    } else {
        return handleUpdateOperationRollback({ txid, tx, recordId, collection, db });
    }
}

/**
 * this will push the array record into array field and then pull the txs record
 * @param tx
 * @param txid
 * @param recordId
 * @param collection
 * @param db
 * @returns {Promise.<void>}
 */
async function handleInsertOperationRollback({ tx, txid, recordId, collection, db }) {
    var push = {};
    var sort = {};
    if (tx.sort) {
        sort[tx.sort] = 1;
    } else {
        sort["_id"] = 1;
    }
    push[tx.field] = { $each: [tx.value], $sort: sort, $slice: -20000 };
    var update = { $push: push };
    update.$pull = {};
    update.$pull["__txs__." + txid + ".tx.array"] = { _id: tx._id, uniqueId: tx.uniqueId };

    await db.update(collection, { _id: recordId }, update);
}

/**
 * this will  pull both field one array inserted record and  the txs record
 * @param tx
 * @param txid
 * @param recordId
 * @param collection
 * @param db
 * @returns {Promise.<void>}
 */
async function handleDeleteOperationRollback({ tx, txid, recordId, collection, db }) {
    var pull = {};
    pull[tx.field] = { _id: tx._id };
    pull["__txs__." + txid + ".tx.array"] = { _id: tx._id, uniqueId: tx.uniqueId };
    var update = { $pull: pull };
    await db.update(collection, { _id: recordId }, update);
}

/**
 * this will set and unset the records and also pull the txs record
 * @param txid
 * @param tx
 * @param recordId
 * @param collection
 * @param db
 * @returns {Promise.<void>}
 */
async function handleUpdateOperationRollback({ txid, tx, recordId, collection, db }) {
    var query = {};
    query._id = recordId;
    query[tx.field + "._id"] = tx._id;
    var update = {};
    if (tx.set !== void 0 && tx.set.length > 0) {
        for (var i = 0; i < tx.set.length; i++) {
            var value = tx.set[i].value;
            if (value) {
                update["$set"] = update["$set"] || {};
                update.$set[tx.field + ".$." + tx.set[i].key] = value;
            } else {
                update["$unset"] = update["$unset"] || {};
                update.$unset[tx.field + ".$." + tx.set[i].key] = 1;
            }
        }
    }
    if (tx.inc !== void 0 && tx.inc.length > 0) {
        update.$inc = {};
        for (var i = 0; i < tx.inc.length; i++) {
            update.$inc[tx.field + ".$." + tx.inc[i].key] = tx.inc[i].value;
        }
    }
    update.$pull = {};
    update.$pull["__txs__." + txid + ".tx.array"] = { _id: tx._id, uniqueId: tx.uniqueId };

    await db.update(collection, query, update);
}

/**
 * this will set ,unset,inc simple fields
 * @param collection
 * @param txToRollback
 * @param newUpdate
 * @param db
 * @returns {Promise.<void>}
 */
async function rollbackTopLevelFields(collection, txToRollback, newUpdate, db, dbConnect, mailConfig) {
    if (txToRollback.set && txToRollback.set.length > 0) {
        for (var i = 0; i < txToRollback.set.length; i++) {
            var innerKey = txToRollback.set[i].key;
            var innerValue = txToRollback.set[i].value;
            if (innerValue !== null) {
                newUpdate["$set"] = newUpdate["$set"] || {};
                newUpdate.$set[innerKey] = innerValue;
            } else {
                newUpdate.$unset[innerKey] = innerValue;
            }
        }
    }

    var matchedRecords = { $inc: {} };

    if (txToRollback.inc && txToRollback.inc.length > 0) {
        for (var i = 0; i < txToRollback.inc.length; i++) {
            /*case --- a number is inc in a object then whole object delete then object.field comes in both set and inc..
                   * test case -- first set then unset a oject then rollback 2
                   * */
            var index = isParentModifiedInSameTx(txToRollback.set, txToRollback.inc[i].key);
            if (index) {
                matchedRecords["$inc"][txToRollback.inc[i].key] = txToRollback.inc[i].value;
            } else {
                newUpdate["$inc"] = newUpdate["$inc"] || {};
                newUpdate["$inc"][txToRollback.inc[i].key] = txToRollback.inc[i].value;
            }
        }
    }
    try {
        await db.update(collection, { _id: txToRollback._id }, newUpdate);
        if (Object.keys(matchedRecords.$inc).length > 0) {
            await await db.update(collection, { _id: txToRollback._id }, matchedRecords);
        }
    } catch (err) {
        if (err.code !== 11000 && err.code !== 16837) {
            throw err;
        } else if (err.code === 16837) {
            return sendMailforErrorInRollBack(err, txToRollback, dbConnect, mailConfig);
        }
    }
}

var sendMailforErrorInRollBack = (err, tx, dbConnect, mailConfig, recepients, subject) => {
    var os = require("os");
    var date = new Date();
    var options = {};
    const { applicationDeveloper, frameworkDeveloper } = mailConfig;
    options.to = recepients || applicationDeveloper || frameworkDeveloper || ["rohit.bansal@daffodilsw.com"];
    options.from = "developer@daffodilsw.com";
    options.subject = subject || "Error in Rollback Transaction";
    options.html = `
       <p> Error: ${err.message} </p></br>
       <p> dir: ${__dirname} </p></br>
       <p> host: ${os.hostname()} </p></br>
       <p> Date: ${date} </p></br>
       <p> Stack: ${err.stack} </p></br>  
       <p> tx:${JSON.stringify(tx)} </p></br>
    `;
    // return dbConnect && dbConnect(invoke("_sendMail", options));
};

/**
 * Transaction records commit or rollback before Server start
 * @param db
 * @returns {Promise.<void>}
 * @private
 */
export const _rollbackPendingTxs = async (db, { port, mailConfig, dbConnect, context }) => {
    /*query to find the txid's for removing the txs and status for rollback or commit operation
       * $stages defined because $sort is not supported in $group query.
       * $sort is defined so that id any record and status committing it places at first place.
       * */
    // sort: { status: 1 },
    // group: { _id: "$txid", status: { $first: "$status" } }
    let txInfos = await db.aggregate("TXS", [
        { $match: { port } },
        { $sort: { status: 1 } },
        { $group: { _id: "$txid", status: { $first: "$status" } } }
    ]);
    txInfos = txInfos && txInfos.result;
    for (let i = 0; i < txInfos.length; i++) {
        let txInfo = txInfos[i];
        var txId = txInfo._id;
        if (!txId) {
            continue;
        }
        var status = txInfo.status;

        let transactionInstance = new Transaction(db, txId, { port, mailConfig, context });

        if (status === "committing") {
            await transactionInstance.commit();
        } else {
            await transactionInstance.rollback(dbConnect);
        }
    }
};






