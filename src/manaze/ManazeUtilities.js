export const getLocation=()=> {
    if (typeof window !== undefined) {
        return window.location || { pathname: "/" };
    }
}

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