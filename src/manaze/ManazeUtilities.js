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