"use strict";
import React from "react";
import { observer, Provider, inject } from "mobx-react";
import {getLocation,splitPath,Platform,setLocation,deepClone} from "./ManazeUtilities";

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
        this.state={loading:true}
    }
    componentDidMount() {
         console.log("did mount called")
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
           this.setState({"Components":comp,loading:false})
       })
    }
    componentDidUpdate(prevProps) {
        console.log("componentDidUpdate mount called")
        // Typical usage (don't forget to compare props):
        let {path,routes,params}=this.props;
         console.log("params"+JSON.stringify(params))
        if (params.reload) {
            // console.log("path updated")
            const roots = this.splitRoots(path, routes);
            this.getComponents(roots).then(comp=>{
                this.setState({"Components":comp,loading:false})
                return;
            })
            params.reload=false;
        }
    }

   async getComponents(roots) {
         const { webConnect,params} = this.props;
        let components = [];
        for (let index = 0; index < roots.length; index++) {

            const {root, model} = roots[index];
             // console.log("root>>>>>"+JSON.stringify(roots[index]))
             //  console.log("model>>>>>"+JSON.stringify(model))
            let modeldata=deepClone(model)
             let  Rcomponent = modeldata.component;
             let  query = modeldata.query;
            let  data={};
            if(query && (params.isdetail || params.iscreate) && params.filter){
                query.filter=params.filter;
            }
             if(query && query.table){
                 query.limit=20;
                 data=await webConnect.find(query)
             }
             // console.log("Rcomponent>>>>>",Rcomponent)


            let com= (
                <Provider data={data}>
                    <Rcomponent />
                </Provider>
            );
            components = [];
            components.push(com)
        }
        return components;
    }

    splitRoots(paths, routes) {
        // console.log(">>>>>>>path>>>>>", paths);
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
            // console.log("lastIndexOf>>>>"+lastIndexOf)
            if (lastIndexOf > 0) {
                viewName = subPath.substring(lastIndexOf + 1);
                hash = subPath.substring(1, lastIndexOf).split("#").join("");
            } else {
                viewName = subPath.substring(1);
            }
            accumPath = `${accumPath}${subPath}`;
            // console.log("accumPath>>>>"+accumPath)
            let view = void 0;
            let route = void 0;
            let relation = void 0;
                let matchViewInfo = matchView({ view: viewName, routes });
            // console.log("matchViewInfo is>>>>",matchViewInfo)
            view = matchViewInfo.view;
            route = matchViewInfo.route;
            // console.log("route is>>>>",route)
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
        // console.log("root>>>>",roots)
        return roots;
    }

    render() {
          const { path, children, routes} = this.props;
          console.log("Router path called>>>>>"+JSON.stringify(path))
         // const roots = this.splitRoots(path, routes);
         const Components = this.state.Components;
         const loading = this.state.loading;

        return React.cloneElement(children, { Internal: Components,loading});
    }
}

export default Router;
