import React from "react";
import { observable } from "mobx";
import { Provider, observer, inject } from "mobx-react";
import Router from "./Router";
import {routes} from "./../Routes";
import WebConnect,{loadUser} from "./WebConnect";
import Methods from "../components/Testing";
import {getLocation,splitPath} from "./ManazeUtilities"
let {External}=Methods;

const config = {
    url: "http://127.0.0.1:5000"
};

const webConnect = new WebConnect({ config });
const userStore = observable.map({});
loadUser()
    .then(user => {
        if (user) {
            webConnect.setUser(user);
            userStore.set("status", "logged_in");
        } else {
            userStore.set("status", "logged_in");
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
        let pathToSet = userStatus !== "logged_in" ? "/login" : pathname === "/" ? "/resources" : pathname + hash;
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