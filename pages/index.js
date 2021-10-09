import useFirebaseAuth, {FINISHED} from "../utils/firebase/auth";
import {Divider, Title} from "../utils/components/utils";
import GlobalHeader from "../utils/components/header";
import React from "react";

export default function Home() {
    const auth = useFirebaseAuth();
    if (auth.loading !== FINISHED) return null;
    if (auth.authUser == null) {
        window.location.href = "/login";
        return null;
    }
    const msg = `Welcome Back, ${auth.userData.username}`;
    return (
        <div className={'fullscreen'}>
            <title>Home</title>
            <GlobalHeader authInfo={auth}/>
            <div className={'content'}>
                <Title name={msg}/>
                <Divider/>
                <p>{""}</p>
            </div>
        </div>
    );
}
