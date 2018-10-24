import React from "react";
import './../Manaze.css';
import { observer, Provider, inject } from "mobx-react";
import List from "./List"
class External extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {Internal} = this.props;
        console.log("internal>>>>",Internal)
        return (
           <div className="outer">
               <div className="flex-1">
                   {<div className="App-header">
                       Header
                   </div>}
               </div>
               {Internal.map((m1)=>(<div className="flex-1">{m1}</div>)) }

           </div>
        );
    }
}



@inject("data")
@inject("meta")
class Resource extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {meta, data} = this.props;
        console.log("data in internal is>>>>"+JSON.stringify(data))
        return (
            <div className="flex-1">
                   <List/>
            </div>
        );
    }
}
@inject("data")
class Project extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { data} = this.props;
        console.log("data in internal is>>>>"+JSON.stringify(data))
        return (

                <List detail={"project_detail"}/>

        );
    }
}
@inject("data")
class Task extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { data} = this.props;
        console.log("data in internal is>>>>"+JSON.stringify(data))
        return (
            <div className="flex-1">
                <List/>
            </div>
        );
    }
}

@inject("data")
class Progress extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { data} = this.props;
        console.log("data in internal is>>>>"+JSON.stringify(data))
        return (
            <div className="flex-1">
                <List/>
            </div>
        );
    }
}
@inject("data")
class Login extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { data} = this.props;
        console.log("data in internal is>>>>"+JSON.stringify(data))
        return (
            <div className="flex-1">
                Login called
            </div>
        );
    }
}

const Methods = {
    External,
    Resource,
    Project,
    Login,
    Task,
    Progress

};

export default Methods;
