import React, { Component } from 'react';
import '../Login.css'
class SignupComponent extends Component {
    render() {
        return (
            <div class="wrapper">
                <div class="container">
                    <form action="/action_page.php">
                        <div class="row">
                            <div class="colSignup">
                                <h2 style={{"text-align":"center"}}>Sign Up</h2>
                                <div class="hide-md-lg">
                                    <p>Or sign in manually:</p>
                                </div>

                                <input type="text" name="firstname" placeholder="First Name" required />
                                <input type="text" name="lastname" placeholder="Lirst Name" required />
                                <input type="email" name="email" placeholder="Email" required />
                                <input type="password" name="password" placeholder="Password" required />
                                <input type="submit" value="SignUp" />
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default SignupComponent;
