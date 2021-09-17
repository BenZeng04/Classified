import React, {useState} from "react";
import useFirebaseAuth, {FINISHED} from "../utils/firebase/auth";
import LoginForm from "../utils/components/loginForm";
import {Divider, Error, Title} from "../utils/components/utils";
import GlobalHeader from "../utils/components/header";

export default function Login() {

    const auth = useFirebaseAuth();
    const [error, setError] = useState(null);
    if (auth.loading !== FINISHED) return null;
    if (auth.authUser != null) {
        window.location.href = "/";
        return null;
    }
    return (
        <div className={'fullscreen'}>
            <title>Login</title>
            <GlobalHeader authInfo={auth}/>
            <div className={'content'}>
                <Title name={"Login"}/>
                <Divider/>
                <LoginForm setError={setError}/>
                {
                    error == null ? <></> : <Error error={error}/>
                }
            </div>
        </div>

    );
}
