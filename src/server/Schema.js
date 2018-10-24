let tripSchema = {
    _id: {type: "objectId"},
    vehicle: {type: "fk", table: "vehicle"},
    transporter: {type: "fk", table: "entities"},
    customer: {type: "fk", table: "entities"},
    // imei_mapping: {type: "fk", table:"imei_mapping"},
    imei: "string",
    status: "string",
}
let truckSchema = {
    _id: {type: "objectId"},
    truck_no: "string",
    vehicle_type: "string",
    imei: "string",
    alert_time: "date",
    powercut: "boolean",
    transporter: {type: "fk", table: "transpoter"},
}
let entitySchema = {
    _id: {type: "objectId"},
    name: "string",
    email: "string",
    branch: {type: "fk", table: "transpoterbranch"}
}
let entityBranchSchema = {
    _id: {type: "objectId"},
    name: "string",
    email: "string",
    city: {type: "fk", table: "city"}

}
let citySchema = {
    _id: {type: "objectId"},
    name: "string",
    state: {type: "fk", table: "state"}

}
let stateSchema = {
    _id: {type: "objectId"},
    name: "string",

}
let studentSchema = {
    _id: {type: "objectId"},
    name: "string",

}

export const getSchema = (table) => {
    if (table == "trip") {
        return tripSchema;
    } else if (table == "vehicle") {
        return truckSchema;
    } else if (table == "transpoter") {
        return entitySchema;
    } else if (table == "transpoterbranch") {
        return entityBranchSchema;
    }
    else if (table == "city") {
        return citySchema
    }
    else if (table == "state") {
        return stateSchema
    }
    else if (table == "student") {
        return studentSchema
    }
    return null;
}