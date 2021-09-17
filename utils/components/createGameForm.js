import React from "react";
import {db} from "../firebase/firebase";
import {addPlayerToLobby, createLobby} from "../firebase/lobbyCreation";


class CreateGameForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {name: ''};
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        const authInfo = this.props.authInfo;

        createLobby(this.state.name).then((id) => {
            addPlayerToLobby(id, authInfo.authUser.uid).then(() => {
                window.location.replace("/lobby");
            })
        })
    }

    render() {
        return (
            <form className={'form'} onSubmit={this.onSubmit}>
                <input required className={'top-input-offset'} type="text" minLength={3} maxLength={30}
                       onChange={(evt) => this.setState({name: evt.target.value})} placeholder={"Lobby Name"}/>
                <input type="submit" className={'submit'} value="Create Game!"/>
            </form>
        );
    }
}

export default CreateGameForm;