import React from "react";
import { observable } from "mobx";
import { Provider, observer, inject } from "mobx-react";
import Router from "./Router";
 import WebConnect,{loadUser} from "./WebConnect";
// import { find, findData, upload } from "./WebDbConnect";
import Methods from "../component/Testing";
let {Project,Progress,Task,Login,Resource,External}=Methods;

let routes=
    {
        project_detail: {
            component:Task
        },
        resources:{
            component:Resource
        },
        projects:{
            component:Project
        },
        tasks:{
            component:Task
        },
        progress:{
            component:Progress
        },
        login:{
            component:Login
        }
    }
function getLocation() {
    if (typeof window !== undefined) {
        return window.location || { pathname: "/" };
    }
}

const config = {
    url: "http://127.0.0.1:5000"
};
const splitPath = path => {
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
 const webConnect = new WebConnect({ config });
const userStore = observable.map({});
userStore.set("status", "logged_in")
loadUser()
    .then(user => {
        if (user) {
            webConnect.setUser(user);
            userStore.set("status", "logged_in");
        } else {
            userStore.set("status", "logged_out");
        }
    })
    .catch(e => {
        console.log("error in load user >>>", e);
    });

@observer
class ManazeApp extends React.Component {
    render() {
        if (!userStore.get("status")) {
            return "Loading...";
        }
        return (
            <Provider userStore={userStore}>
                <ManazeAppComponent />
            </Provider>
        );
    }
}

@inject("userStore")
@observer
class ManazeAppComponent extends React.Component {
    constructor(props) {
        super(props);
        let { pathname, hash } = getLocation();
        let userStatus = userStore.get("status");
        let pathToSet = userStatus !== "logged_in" ? "/login" : pathname === "/" ? "/resource" : pathname + hash;
        this.path = observable(splitPath(pathToSet));
        this.params = {
            reportingPeriod: observable({
                value: null
            })
        };
    }
    render() {
        return (
            <Provider path={this.path}  params={this.params}>
                <Router routes={routes}>
                    <External/>
                </Router>
            </Provider>
        );
    }
}


export default ManazeApp;
