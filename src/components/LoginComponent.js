import React, { Component } from 'react';
import '../Login.css'
class LoginComponent extends Component {
    render() {
        return (
            <div class="wrapper">
            <div class="container">
                <form action="/action_page.php">
                    <div class="row">

                        <div class="col">
                            <div class="hide-md-lg">
                                <p>Or sign in manually:</p>
                            </div>
                            <h2 style={{"text-align":"center"}}>Login  Manually</h2>
                            <input type="text" name="username" placeholder="Username" required />
                                <input type="password" name="password" placeholder="Password" required />
                                    <input type="submit" value="Login" />
                                <div class="row">
                                    <div class="colfot">
                                        <a href="#" style={{"color":"black"}} class="btn">Sign up</a>
                                    </div>
                                    <div class="colfot">
                                        <a href="#" style={{"color":"black"}} class="btn">Forgot password?</a>
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