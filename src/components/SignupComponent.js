import React, { Component } from 'react';
import {inject} from "mobx-react"
import '../Login.css'

@inject("path")
@inject("params")
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
        let {path,params}=this.props;
        event.preventDefault();
        path.pop()
        params.reload=true;
    }
    render() {
        console.log("this.state>>>>>>>>>>>>>",this.state)
        return (
            <div class="wrapper">
                <div class="container">
                    <form onSubmit={this.handleSubmit}>
                        <div class="row">
                            <div class="colSignup">
                                <h2 style={{"text-align":"center"}}>Sign Up</h2>
                                <div class="hide-md-lg">
                                    <p>Or sign in manually:</p>
                                </div>

                                <input type="text" name="firstname" placeholder="First Name" value={this.state.firstname} onChange={this.handleChange} required />
                                <input type="text" name="lastname" placeholder="Lirst Name" value={this.state.lastname} onChange={this.handleChange}/>
                                <input type="email" name="email" placeholder="Email" value={this.state.email} onChange={this.handleChange} />
                                <input type="password" name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange}/>
                                <input type="submit" value="Submit" />
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default SignupComponent;
