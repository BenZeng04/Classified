import useFirebaseAuth, {FINISHED} from "../utils/firebase/auth";
import {Divider, Error, Title} from "../utils/components/utils";
import Field from "../utils/components/field"
import GlobalHeader from "../utils/components/header";
import {useEffect, useState} from "react";
import {db} from "../utils/firebase/firebase";


export default function Lobby() {
    const auth = useFirebaseAuth();
    const [gameStarted, setGameStarted] = useState(false);
    if (auth.loading !== FINISHED) return null;
    if (auth.authUser == null) {
        window.location.href = "/login";
        return null;
    }
    if (auth.currentMatchID == null) {
        window.location.href = "/"
        return null;
    }
    return (
        <div className={'fullscreen'}>
            <title>Lobby</title>
            <GlobalHeader authInfo={auth}/>
            <div className={'content lobby'}>
                <Title name={`${auth.matchData.matchName} | Match Code: ${auth.currentMatchID}`}/>
                <Divider/>
                {
                    !gameStarted? <Error error={"Waiting for game to start... (Make sure you've sent the match code to someone!)"}/>: <></>
                }
                <Field authInfo={auth} startGame={() => setGameStarted(true)}/>
            </div>
        </div>
    );
}
