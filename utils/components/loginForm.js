import React from "react";
import {auth} from "../firebase/firebase";


class LoginForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {email: '', password: ''};
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        auth.signInWithEmailAndPassword(this.state.email, this.state.password).then((user) => {
            window.location.replace("/");
        }).catch((error) => {
            this.props.setError(error.message);
        })

    }

    render() {
        return (
            <form className={'form'} onSubmit={this.onSubmit}>
                <input required className={'top-input-offset'} type="email"
                       onChange={(evt) => this.setState({email: evt.target.value})} placeholder={"Email"}/>
                <input required type="password"
                       onChange={(evt) => this.setState({password: evt.target.value})} placeholder={"Password"}/>
                <input type="submit" className={'submit'} value="Log In"/>
            </form>
        );
    }
}

export default LoginForm;