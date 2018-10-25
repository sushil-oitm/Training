import React from "react";
import { observer, Provider, inject } from "mobx-react";
import "../App.css"
class External extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {Internal} = this.props;
        console.log("internal>>>>",Internal)
        return (
           <div className="outer">
               <div className="header">
                 <header><h3>Header</h3></header>
               </div>
               <div class="content">
               {Internal.map((m1)=>(<div className="inner-text">{m1}</div>)) }
               </div>
               <div className="footer">
                   <footer><h3>Footer</h3></footer>
               </div>
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
                Resource called
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
            <div className="flex-1">
                Project called
            </div>

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
                Task called
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
                Progress called
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
