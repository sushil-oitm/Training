import {map, get, uniq, flatten, pullAll} from "lodash";

export const isValidEmail = value => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        return true;
    }
};

export const iterator = (array, task) => {
    return new Promise((resolve, reject) => {
        var length = array ? array.length : 0;
        if (length === 0) {
            resolve();
            return;
        }
        var index = 0;
        var loop = index => {
            try {
                var onResolve = function () {
                    index = index + 1;
                    if (index === array.length) {
                        resolve();
                    } else {
                        loop(index);
                    }
                };
                try {
                    var p = task(index, array[index]);
                    if (!p) {
                        onResolve();
                        return;
                    }
                    p.then(onResolve).catch(function (err) {
                        reject(err);
                    });
                } catch (e) {
                    reject(e);
                }
            } catch (e) {
                reject(e);
            }
        };
        loop(index);
    });
};

export const getContextVariables = options => {
    if (options) {
        options = {
            ...options
        };
    }
    var CLA = getCLAs(options);
    var env = process.env;
    return {
        ...env,
        ...CLA
    };
};

export const getCLAs = (config = {}) => {
    if (!process.argv) {
        return config;
    }
    return process.argv.reduce((prev, current) => {
        var indexOf = current.indexOf("=");
        if (indexOf >= 0) {
            var value = current.substring(indexOf + 1);
            if (value !== undefined) {
                try {
                    value = JSON.parse(value);
                } catch (err) {
                }
                putDottedValue(prev, current.substring(0, indexOf), value);
            }
        }
        return prev;
    }, config);
};

export const putDottedValue = (data, key, value) => {
    if (!data) {
        throw new Error("data does not exists for putting dotted value");
    }
    var lastDottedIndex = key.lastIndexOf(".");
    if (lastDottedIndex >= 0) {
        var firstExpression = key.substring(0, lastDottedIndex);
        key = key.substring(lastDottedIndex + 1);
        data = resolveDottedValue(data, firstExpression, true);
    }
    data[key] = value;
};

export const resolveDottedValue = (data, expression, confirm, confirmType) => {
    if (!data) {
        return;
    }
    while (expression !== undefined) {
        var fieldIndex = expression.indexOf(".");
        var exp = expression;
        if (fieldIndex >= 0) {
            exp = expression.substring(0, fieldIndex);
            expression = expression.substring(fieldIndex + 1);
        } else {
            expression = undefined;
        }

        if ((data[exp] === undefined || data[exp] === null) && !confirm) {
            return;
        }
        if (data[exp] !== undefined && data[exp] !== null) {
            data = data[exp];
        } else {
            if (expression) {
                data[exp] = {};
            } else {
                if (confirmType === "array") {
                    data[exp] = [];
                } else {
                    data[exp] = {};
                }
            }
            data = data[exp];
        }
    }
    return data;
};

var ObjConstructor = {}.constructor;

export const isJSONObject = obj => {
    if (
        obj === undefined ||
        obj === null ||
        obj === true ||
        obj === false ||
        typeof obj !== "object" ||
        Array.isArray(obj)
    ) {
        return false;
    } else if (obj.constructor === ObjConstructor || obj.constructor === undefined) {
        return true;
    } else {
        return false;
    }
};

export const isArray = data => {
    return Array.isArray(data) || isObservableArray(data);
};

export const deepClone = value => {
    var typeOfValue = typeof value;
    var cloneValue = value;
    if (
        !value ||
        typeOfValue === "boolean" ||
        typeOfValue === "string" ||
        typeOfValue === "function" ||
        typeOfValue === "number"
    ) {
        //do nothing
    } else if (value instanceof Date) {
        cloneValue = new Date(value);
    } else if (value instanceof Array) {
        cloneValue = value.map(deepClone);
    } else if (isJSONObject(value)) {
        cloneValue = {};
        for (var key in value) {
            cloneValue[key] = deepClone(value[key]);
        }
    }
    return cloneValue;
};

export const populateDottedFields = (fields, pField) => {
    if (!fields) {
        return;
    }
    var queryFields = {};
    for (var key in fields) {
        var value = fields[key];
        var mainKey = pField ? pField + "." + key : key;
        if (isJSONObject(value)) {
            var dottedFields = populateDottedFields(value, mainKey);
            Object.assign(queryFields, dottedFields);
        } else {
            queryFields[mainKey] = value;
        }
    }
    return queryFields;
};

export const getNullOrObject = value => {
    if (isJSONObject(value) && Object.keys(value).length) {
        return value;
    } else {
        return null;
    }
};

export const deepEqual = (first, second) => {
    if (!first || !second) {
        return first === second;
    }
    if (first === second) {
        return true;
    } else if (Array.isArray(first) && Array.isArray(second)) {
        var firstLength = first.length;
        var secondLength = second.length;
        if (firstLength !== secondLength) {
            return false;
        } else {
            for (var i = 0; i < firstLength; i++) {
                if (!deepEqual(first[i], second[i])) {
                    return false;
                }
            }
            return true;
        }
    } else if (typeof first === typeof second && typeof first === "number" && isNaN(first) && isNaN(second)) {
        return true;
    } else if (first instanceof Date && second instanceof Date) {
        if (first.getTime() === second.getTime()) {
            return true;
        } else {
            return false;
        }
    } else if (isJSONObject(first) && isJSONObject(second)) {
        var firstKeys = Object.keys(first);
        var secondKeys = Object.keys(second);
        if (firstKeys.length !== secondKeys.length) {
            return false;
        } else {
            for (var k = 0; k < firstKeys.length; k++) {
                var keyName = firstKeys[k];
                if (!deepEqual(first[keyName], second[keyName])) {
                    return false;
                }
            }
            return true;
        }
    } else if (first.toString && second.toString && first.toString() === second.toString()) {
        /*Check to validate objectid case from effects,on server check for objectId*/
        return true;
    } else {
        return false;
    }
};

export const resolveValue = (values, key) => {
    if (!values || !key) {
        return values;
    }
    let result = getValue(values, key);
    if (result === undefined || (Array.isArray(result) && result.length === 0)) {
        var indexOf = key.indexOf(".");
        if (indexOf === -1) {
            return result;
        }
        var firstPart = key.substring(0, indexOf);
        var nextPart = key.substring(indexOf + 1);
        result = getValue(values, firstPart);
        if (result === undefined || (Array.isArray(result) && result.length === 0)) {
            return result;
        } else {
            return resolveValue(result, nextPart);
        }
    }
    return result;
};
const getValue = (values, key) => {
    let result;
    if (Array.isArray(values)) {
        result = flatten(map(values, key));
    } else {
        result = get(values, key);
    }
    if (Array.isArray(result)) {
        result = uniq(result);
    }
    if (Array.isArray(result)) {
        result = pullAll(result, [undefined]);
    }
    return result;
};