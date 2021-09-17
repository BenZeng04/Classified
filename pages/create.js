import React, {useState} from "react";
import useFirebaseAuth, {FINISHED} from "../utils/firebase/auth";
import {Divider, Error, Title} from "../utils/components/utils";
import GlobalHeader from "../utils/components/header";
import CreateGameForm from "../utils/components/createGameForm";

export default function Create() {
    const auth = useFirebaseAuth();
    const [error, setError] = useState(null);
    if (auth.loading !== FINISHED) return null;
    if (auth.authUser == null) {
        window.location.href = "/login";
        return null;
    }
    return (
        <div className={'fullscreen'}>
            <title>Create Match</title>
            <GlobalHeader authInfo={auth}/>
            <div className={'content'}>
                <Title name={"Create Match"}/>
                <Divider/>
                <CreateGameForm authInfo={auth} setError={setError}/>
                {
                    error == null ? <></> : <Error error={error}/>
                }
            </div>
        </div>

    );
}
