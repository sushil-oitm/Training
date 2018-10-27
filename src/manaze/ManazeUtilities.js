export const getLocation=()=> {
    if (typeof window !== undefined) {
        return window.location || { pathname: "/" };
    }
}

export const setLocation=(path)=> {
    if (typeof window !== undefined && Platform.OS === "web") {
        let location = window.location;
        let pathname = location.pathname + location.hash;
        let history = window.history;
        /*check if the path is not same as current one on window refresh by pathname !== path akshay 2Jan*/
        history && pathname !== path && history.pushState({}, "", path);
    }
};

export class Platform {
    static OS = "web";
};

export const splitPath = path => {
    let split = path.trim().split("/");
    let paths = [];
    let pathToPush = "";
    split.forEach(subPath => {
        subPath = subPath.trim();
        if (subPath.length === 0) {
            return;
        }
        pathToPush += `/${subPath}`;
        const indexOfHash = subPath.indexOf("#");
        if (indexOfHash === -1) {
            paths.push({ path: pathToPush });
            pathToPush = "";
        }
    });
    if (pathToPush) {
        paths.push({ path: pathToPush });
    }
    return paths;
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