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
        // let pathLength=path.length;
        params.reload=true;
        path.pop();
        event.preventDefault();

    }
    render() {
        console.log("this.state>>>>>>>>>>>>>",this.state)
        return (
            <div class="wrapper">
                <div class="container">
                     <div class="row">
                            <div class="colSignup">
                                <h2 style={{"text-align":"center"}}>Sign Up</h2>
                                <div class="hide-md-lg">
                                    <p>sign in manually:</p>
                                </div>
                                <input name="firstname" placeholder="First Name" value={this.state.firstname} onChange={this.handleChange} required />
                                <input name="lastname" placeholder="Lirst Name" value={this.state.lastname} onChange={this.handleChange}/>
                                <input name="email" placeholder="Email" value={this.state.email} onChange={this.handleChange} />
                                <input name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange}/>
                                <button style={{"color": "black"}} onClick={this.handleSubmit}
                                        className="btn">Submit</button>
                            </div>

                        </div>

                </div>
            </div>
        );
    }
}

export default SignupComponent;
