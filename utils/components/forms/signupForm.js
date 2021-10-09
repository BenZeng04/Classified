import React from "react";
import {auth, db} from "../../firebase/firebase";


class SignupForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {username: '', email: '', password: ''};
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        auth.createUserWithEmailAndPassword(this.state.email, this.state.password).then((user) => {
            const userDoc = db.collection("users").doc(user.user.uid);
            userDoc.set({
                username: this.state.username,
                currentMatchID: null
            }).then(() => {
                console.log("Document successfully written!");
                window.location.replace("/")
            })
                .catch((error) => {
                    console.error("Error writing document: ", error);
                });
        }).catch((error) => {
            this.props.setError(error.message);
        })

    }

    render() {
        return (
            <form className={'form'} onSubmit={this.onSubmit}>
                <input required className={'top-input-offset'} type="text" minLength={3}
                       maxLength={30} // TODO VALIDATE THAT MAX LENGTH IS 30
                       onChange={(evt) => this.setState({username: evt.target.value})} placeholder={"Display Name"}/>
                <input required type="email"
                       onChange={(evt) => this.setState({email: evt.target.value})} placeholder={"Email"}/>
                <input required type="password"
                       onChange={(evt) => this.setState({password: evt.target.value})} placeholder={"Password"}/>
                <input type="submit" className={'submit'} value="Sign Up"/>
            </form>
        );
    }
}

export default SignupForm;