import React from "react";
import { observer, Provider, inject } from "mobx-react";
import SimpleMenu from "./Menu"
import Logout from "./Logout"
import "../App.css"

@inject("userStore")
@observer
class External extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {Internal,loading,userStore} = this.props;

        return (
           <div className="outer">
               <div className="header">
                   <header>
                       <div class="menu" style={{"float":"left"}}>{userStore.get("status")=="logged_in" && <SimpleMenu />}</div>
                       <div class="logout" style={{"marginRight":"5px"}}>
                           { userStore.get("status")=="logged_in" &&  <Logout />}
                       </div>
                   </header>
               </div>
               <div class="Maincontent">
                   {!loading && Internal && Internal.map((m1)=>(<div className="inner-text">{m1}</div>)) }
               </div>
               <div className="footer">
                   <footer></footer>
               </div>
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
