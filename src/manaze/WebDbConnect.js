import Dataset from "./Dataset";

export const DbConnect = db => {
    return (fn, data) => {
        if (fn && fn._pipeline) {
            fn._pipeline.init(db, data);
        } else if (typeof fn == "function") {
            return fn(db, data);
        } else {
            return data;
        }
    };
};

//for computations
const _find = (model, query) => {
    return db => {
        return db.find(model, { id: query._id, paramValue: query._paramValue });
    };
};

//for router/suggestion box
export const find = db => {
    return (model, query, props = {}) => {
        const dataset = new Dataset(model, query, db, props, _find);
        return dataset.dataset;
    };
};

//for user login
export const findData = db => {
    return (model, query) => {
        if (typeof query == "string") {
            query = { id: query };
        }
        return db.find(model, query);
    };
};

export const upload = db => {
    return (file, options) => {
        return db.upload(file, options);
    };
};
