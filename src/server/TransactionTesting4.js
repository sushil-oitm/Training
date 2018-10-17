var MongoClient = require("mongodb").MongoClient;


function runTransactionWithRetry(txnFunc, session,db) {
    console.log("runTransactionWithRetry...");
    while (true) {
        try {
            txnFunc(session,db);  // performs transaction
            break;
        } catch (error) {
            // If transient error, retry the whole transaction
            if ( error.hasOwnProperty("errorLabels") && error.errorLabels.includes("TransientTransactionError")  ) {
                console.log("TransientTransactionError, retrying transaction ...");
                continue;
            } else {
                throw error;
            }
        }
    }
};

// Retries commit if UnknownTransactionCommitResult encountered

function commitWithRetry(session) {
    while (true) {
        try {
            session.commitTransaction(); // Uses write concern set at transaction start.
            // console.log("Transaction committed.");
            break;
        } catch (error) {
            // Can retry commit
            if (error.hasOwnProperty("errorLabels") && error.errorLabels.includes("UnknownTransactionCommitResult") ) {
                 print("UnknownTransactionCommitResult, retrying commit operation ...");
                continue;
            } else {
                console.log("Error during commit ...");
                throw error;
            }
        }
    }
};

// Updates two collections in a transactions

let  updateEmployeeInfo=async(session,client)=> {
     console.log("updateEmployeeInfo  caled")
   // let employeesCollection = session.getDatabase("manaze_testing");
   // let eventsCollection = session.getDatabase("manaze_testing");
    const ordersCollection = client.db("test_db").collection("orders");
    const customersCollection = client.db("test_db").collection("customers");
    // let db = client.db("manaze_testing");
    session.startTransaction();

    try{
        console.log("into the session ")
        ordersCollection.insertOne({ customer_id: 1, name: "Ankush", customer_orders: [] }, {session})
        console.log("into the session end>>>>>> ")
    } catch (error) {
         console.log("Caught exception during transaction, aborting."+error.stack);
        session.abortTransaction();
        throw error;
    }
     session.commitTransaction()
};

// Start a session.


export  const testTransaction=async(config)=>{
     console.log("testTransaction>>>> called")
    let dbs={};
    let client5=await connectDB(config,dbs);
    let session = client5.startSession();
    let client= client5.db("dbName")

    session.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' }
    });

    const employeesCollection = client.db('hr').collection('employees');
    const eventsCollection = client.db('reporting').collection('events');

    await employeesCollection.updateOne(
        { employee: 3 },
        { $set: { status: 'Inactive' } },
        { session }
    );
    await eventsCollection.insertOne(
        {
            employee: 3,
            status: { new: 'Inactive', old: 'Active' }
        },
        { session }
    );

    try {
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    }
}
   //     session.startTransaction();
   //   // session.startTransaction( { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } } );
   //  try{
   //      let table="orders";
   //      let newValue={ employee: 3, status: { new: "Inactive", old: "Active" }};
   //      let options={};
   //      let insertData=await insert(connection,table,newValue,{session})
   //      // ordersCollection.insertOne({ order_id: 1, item: 'phone', quantity: 1, price: 8000 }, {session});
   //
   //      throw new Error("stop here>>>")
   //  } catch (error) {
   //      console.log("Caught exception during transaction, aborting."+error.stack);
   //       session.abortTransaction();
   //      console.log("abortTransaction successfully");
   //      throw error;
   //  }
   //   console.log("commitTransaction successfully");
   //   session.commitTransaction();
   // };


let connectDB=(config,dbs)=> {
    return new Promise((resolve, reject) => {
        const { host, port, dbName,authEnabled,user,authDB,pwd } =config;
        if (dbs[dbName]) {
            resolve(dbs[dbName]);
            return;
        }
        let url;
        if (authEnabled) {
            url = `mongodb://${user}:${pwd}@${host}:${port}/${authDB}?authSource=${authDB}`;
        } else {
            // url = `mongodb://${host}:${port}/`;
            url = `mongodb://${host}:${port}/dbName?replicaSet=rs`
        }
        MongoClient.connect(url, (err, client) => {
            if (err) {
                console.log("Error in connect to db", err);
                reject(err);
                return;
            }
            // let session = client.startSession();
            // sessionDB["s"+dbName] = session;

            let db = client
            db.on("timeout", (error, db) => {
                delete dbs[dbName];
            });
            db.on("close", _ => {
                delete dbs[dbName];
            });
            dbs[dbName] = db;
            resolve(db);
        });
    });
};

let insert=(mongoDB ,table, insert,  options)=> {
    console.log("insert called>>>")
    return new Promise((resolve, reject) => {
                const newValue = { ...insert };
                mongoDB.collection(table).insertOne(newValue, options, function(err, result) {
                    if (err) {
                        console.log("err in insert>>>>>>>"+err.stack)
                        reject(err);
                    } else {
                        console.log("insert successfully")
                        resolve(result);
                    }
                })
    });
};