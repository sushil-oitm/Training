import React from "react";
import { observer, Provider, inject } from "mobx-react";


@observer
class External extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {Internal,loading} = this.props;
        return (
           <div className="outer">
               <div className="flex-1">
                   {<div className="App-header">
                       Header
                   </div>}
               </div>
               {!loading && Internal && Internal.map((m1)=>(<div className="flex-1">{m1}</div>)) }

           </div>
        );
    }
}



@inject("data")
@inject("meta")
@observer
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
@observer
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
@observer
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
@observer
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
