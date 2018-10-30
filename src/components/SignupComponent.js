import React, { Component } from 'react';
import {inject} from "mobx-react"
import '../Login.css'

@inject("path")
@inject("params")
@inject("webConnect")
class SignupComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {firstname: "",
            lastname:"",
            email:"",
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
        let {path,params,webConnect}=this.props;
        let data= {
            "firstName":this.state.firstname + " "+this.state.lastname,
            "password":this.state.password,
            "email":this.state.email,
            }
       let createuser= await webConnect.invoke({"id":"createUser",param:data})
        if(!createuser.result)
        {
            console.log("createuser>>>>",createuser)
            this.setState({errMessage:createuser.message})
            return
        }
        console.log("createuser out >>>>",createuser)

        // let pathLength=path.length;
        params.reload=true;
        path.pop();
        event.preventDefault();

    }
    render() {
        console.log("this.state>>>>>>>>>>>>>",this.state)
        return (
                <div class="container">
                     <div class="row">
                            <div class="colSignup">
                                <h2 style={{"text-align":"center"}}>Sign Up</h2>
                                <div class="hide-md-lg">
                                    <p>sign in manually:</p>
                                </div>
                                <input style={{"background":"#DEDEDE","color":"black"}} name="firstname" placeholder="First Name" value={this.state.firstname} onChange={this.handleChange} required />
                                <input style={{"background":"#DEDEDE","color":"black"}} name="lastname" placeholder="Lirst Name" value={this.state.lastname} onChange={this.handleChange} required/>
                                <input style={{"background":"#DEDEDE","color":"black"}} name="email" placeholder="Email" value={this.state.email} onChange={this.handleChange} required/>
                                <input style={{"background":"#DEDEDE","color":"black"}} name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange} required/>
                                <button style={{"color":"white","background":"#808080"}} onClick={this.handleSubmit}
                                        className="btn"><b>Submit</b></button>
                                <div>
                                    {this.state.errMessage}
                                </div>
                            </div>

                        </div>
                </div>
        );
    }
}

export default SignupComponent;
