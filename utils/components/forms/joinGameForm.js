import React from "react";
import {addPlayerToLobby} from "../../firebase/lobbyCreation";


class JoinGameForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {gameID: ''};
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        const authInfo = this.props.authInfo;
        addPlayerToLobby(this.state.gameID, authInfo.authUser.uid).then((res) => {
            if (res.success) {
                window.location.replace("/lobby");
            } else {
                this.props.setError(res.message);
            }
        });
    }

    render() {
        return (
            <form className={'form'} onSubmit={this.onSubmit}>
                <input required className={'top-input-offset'} type="text" pattern="[a-zA-Z0-9]+"
                       onChange={(evt) => this.setState({gameID: evt.target.value})} placeholder={"Game ID"}/>
                <input type="submit" className={'submit'} value="Join!"/>
            </form>
        );
    }
}

export default JoinGameForm;