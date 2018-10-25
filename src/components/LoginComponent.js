import React, { Component } from 'react';
import {inject,observer} from "mobx-react"
import '../Login.css'

@inject("path")
@inject("params")
@observer
class LoginComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {username: "",
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

    handleSubmit(event) {
        console.log("this handleSubmit state>>>>>>",this.state)
        // alert('this.state>>>>>>>>>>' + this.state);
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
            <div class="wrapper">
            <div class="container">
                <form onSubmit={this.handleSubmit}>
                    <div class="row">
                        <div class="col">
                            <div class="hide-md-lg">
                                <p>Or sign in manually:</p>
                            </div>
                            <h2 style={{"text-align":"center"}}>Login</h2>
                            <input type="text" name="username" placeholder="Username" value={this.state.username} onChange={this.handleChange} required/>
                                <input type="password" name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange} required />
                                    <input type="submit" value="Login" />
                                <div class="row">
                                    <div class="colfot">
                                        <button style={{"color": "black"}} onClick={this.updatePath}
                                           className="btn">Sign up</button>
                                    </div>
                                    <div class="colfot">
                                        <button  style={{"color":"black"}}onClick={this.updatePath} class="btn">Forgot password</button>
                                    </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>


            </div>
        );
    }
}

export default LoginComponent;