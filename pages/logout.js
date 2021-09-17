import React from "react";
import useFirebaseAuth, {FINISHED} from "../utils/firebase/auth";
import {Divider, Title} from "../utils/components/utils";
import GlobalHeader from "../utils/components/header";

export default function Logout() {
    const authInfo = useFirebaseAuth();
    if (authInfo.loading !== FINISHED) return null;
    return (
        <div className={'fullscreen'}>
            <title>Logout</title>
            <GlobalHeader authInfo={authInfo}/>
            <div className={'content'}>
                <Title name={"Logout"}/>
                <Divider/>
                <p>Logging Out!</p>
            </div>
        </div>
    );
}
