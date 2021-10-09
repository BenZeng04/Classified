import React, {useState} from "react";
import useFirebaseAuth, {FINISHED} from "../utils/firebase/auth";
import {Divider, Error, Title} from "../utils/components/utils";
import GlobalHeader from "../utils/components/header";
import JoinGameForm from "../utils/components/forms/joinGameForm";

export default function Join() {
    const auth = useFirebaseAuth();
    const [error, setError] = useState(null);
    if (auth.loading !== FINISHED) return null;
    if (auth.authUser == null) {
        window.location.href = "/login";
        return null;
    }
    return (
        <div className={'fullscreen'}>
            <title>Join Match</title>
            <GlobalHeader authInfo={auth}/>
            <div className={'content'}>
                <Title name={"Join Match"}/>
                <Divider/>
                <p>Join the match using a unique match code.</p>
                <JoinGameForm authInfo={auth} setError={setError}/>
                {
                    error == null ? <></> : <Error error={error}/>
                }
            </div>
        </div>

    );
}
