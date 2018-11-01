import React, { Component } from 'react';
import {inject,observer} from "mobx-react";
import '../Login.css';

@inject("path")
@inject("params")
@inject("webConnect")
@inject("userStore")
@observer
class LoginComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {email: "",
            password:""

        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        console.log("handleChange>>>>>>",event.target.value)
        console.log("handleChange name>>>>>>",event.target.name)
        let key=event.target.name
        let value=event.target.value
        this.setState({[key]: value});
    }

   async handleSubmit(event) {
       console.log("handleSubmit called>>>>")
       let {path,params,webConnect,userStore}=this.props;
       let data= {
           "email":this.state.email ,
           "password":this.state.password,
       }
       let loggeduser= await webConnect.invoke({"id":"_authenticateUser",param:data})
       console.log("loggeduser>>>>>>>",JSON.stringify(loggeduser))
       if(!loggeduser.result)
       {
           this.setState({loginErrMessage:loggeduser.message})
           return
       }
       await webConnect.setUser(loggeduser.result.user)
       await webConnect.setToken(loggeduser.result.token)
       let finaluser=loggeduser.result.user;
       finaluser["token"]=loggeduser.result.token;
       await webConnect.setLocalStorage("user",JSON.stringify(finaluser))
        let pathLength=path.length;
       params.reload=true;
       userStore.set("status","logged_in")
        path.splice(0,pathLength,{"path":"/resources"})
       event.preventDefault();
    }
    updatePath=()=>{
        let {path,params}=this.props;
        let pathLength=path.length;
        // path.splice(0, pathLength, { path: "/signup"});
         path.push({path:"/signup"})
        params.reload=true;
    }
    render() {
        return (
            <div class="container">
                    <div class="row">
                        <div class="col">
                            <div class="hide-md-lg">
                                <p>Or sign in manually:</p>
                            </div>
                            <h2 style={{"text-align":"center"}}>Login</h2>
                            <input style={{"color":"black","border":"2px solid gray "}} type="text" name="email" placeholder="Email" value={this.state.email} onChange={this.handleChange} required/>
                                <input style={{"color":"black","border":"2px solid gray "}} type="password" name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange} required />
                            <button style={{"color": "black","background":"lightgray"}} onClick={this.handleSubmit}
                                    className="btn"><b>Login</b></button>
                            <div>
                                {this.state.loginErrMessage}
                            </div>
                                <div class="row">
                                    <div class="colfot">
                                        <button style={{"color": "black","background":"lightgray"}} onClick={this.updatePath}
                                                className="btn"><b>Sign up</b></button>
                                    </div>
                                    <div class="colfot">
                                        <button  style={{"color":"black","background":"lightgray"}} onClick={this.updatePath} class="btn"><b>Forgot password</b></button>
                                    </div>
                            </div>
                        </div>

                    </div>


            </div>
        );
    }
}

export default LoginComponent;