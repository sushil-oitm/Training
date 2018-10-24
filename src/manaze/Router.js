"use strict";
import React from "react";
import { observer, Provider, inject } from "mobx-react";
import  {appdata} from "./Data";
import  {fields} from "./metaData";
import {getLocation,splitPath,Platform,setLocation} from "./ManazeUtilities";

const matchView = ({ view, routes }) => {
    let requiredView = null;
    let requiredRoute = null;
    for (var index in routes) {
        const route = routes[index];
        // console.log("route>>>>>>"+JSON.stringify(route))
        // console.log("index>>>>>>"+index)
        // console.log("view>>>>>>"+view)
        requiredView = (index==view)? true:false;
        // console.log("requiredView>>>>>>"+requiredView)
        if (requiredView) {
            requiredRoute = route;
            break;
        }
    }
    if (!requiredView) {
        throw new Error(`View not found ${view}`);
    }
    return {
        view: view,
        route: requiredRoute
    };
};

@inject("webConnect")
@inject("path")
@inject("params")
@observer
class Router extends React.Component {

     constructor(props, context) {
        super(props, context);
        let com=[]
         com.push(<Test />)
        this.state={Components:com}
    }
    componentDidMount() {
        let { path,routes } = this.props;
        if (typeof window !== undefined && Platform.OS === "web") {
            /*onClick browser back button this listener will run -akshay 5JAn */
            window.onpopstate = _ => {
                let { pathname, hash } = window.location;
                path.replace(splitPath(pathname + hash));
            };
            /*onClick browser forward button this listener will run -akshay 5JAn */
            window.onpushstate = _ => {
                let { pathname, hash } = window.location;
                path.replace(splitPath(pathname + hash));
            };
        }

        const roots = this.splitRoots(path, routes);
       this.getComponents(roots, path).then(comp=>{
           this.setState({"Components":comp})
       }).catch(e => {
           alert(e.message || e);
           console.log("error in load logo >>>", e);
       });
    }

   async getComponents(roots, params) {
         const { webConnect} = this.props;
        let components = [];
        for (let index = 0; index < roots.length; index++) {
            const {root, model} = roots[index];
             let  Rcomponent = model.component;
               let  data=await webConnect.find("trip",{filter:{},fields:{}})
            console.log("data in router>>>>>"+JSON.stringify(data))
              let meta=fields[root];
            let com= (
                <Provider data={data} meta={meta}>
                    <Rcomponent />
                </Provider>
            );
            components.push(com)
        }
        return components;
    }

    splitRoots(paths, routes) {
        console.log(">>>>>>>path>>>>>", paths);
        const roots = [];
        var accumPath = "";
        let lastRoute = null;
        for (var index = 0; index < paths.length; index++) {
            let pathInfo = paths[index];
            let { path: subPath, forceRefresh } = pathInfo;
            if (forceRefresh) {
                /*Need to forceRefresh false for case of nested table on saveAndNew */
                pathInfo.forceRefresh = false;
            }
            subPath = subPath.trim();
            if (subPath.length === 0) {
                continue;
            }
            let viewName = subPath;
            let hash = null;

            let lastIndexOf = subPath.lastIndexOf("/");
            console.log("lastIndexOf>>>>"+lastIndexOf)
            if (lastIndexOf > 0) {
                viewName = subPath.substring(lastIndexOf + 1);
                hash = subPath.substring(1, lastIndexOf).split("#").join("");
            } else {
                viewName = subPath.substring(1);
            }
            accumPath = `${accumPath}${subPath}`;
            console.log("accumPath>>>>"+accumPath)
            let view = void 0;
            let route = void 0;
            let relation = void 0;
                let matchViewInfo = matchView({ view: viewName, routes });
                view = matchViewInfo.view;
                route = matchViewInfo.route;
            console.log("route is>>>>",route)
            roots.push({
                hash,
                accumPath,
                routePath: subPath,
                root: view,
                relation,
                forceRefresh,
                model: route
            });
            lastRoute = route;
        }
        setLocation(accumPath);
        console.log("root>>>>",roots)
        return roots;
    }

    render() {
          const { path, children, routes, params } = this.props;
         // const roots = this.splitRoots(path, routes);
         const Components = this.state.Components

        return React.cloneElement(children, { Internal: Components});
    }
}

class Test extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        console.log("Test called>>>>>")
        return (
            <div className="flex-1">
                test called
            </div>
        );
    }
}


export default Router;
