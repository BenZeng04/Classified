import React, {useState} from "react";
import useFirebaseAuth, {FINISHED} from "../utils/firebase/auth";
import {Divider, Error, Title} from "../utils/components/utils";
import GlobalHeader from "../utils/components/header";
import SignupForm from "../utils/components/forms/signupForm";
import {auth, db} from "../utils/firebase/firebase";

export default function SignUp() {
    const authState = useFirebaseAuth();
    const [error, setError] = useState(null);
    if (authState.loading !== FINISHED) return null;
    if (authState.authUser != null) {
        window.location.href = "/";
        return null;
    }
    return (
        <div className={'fullscreen'}>
            <title>Sign Up</title>
            <GlobalHeader authInfo={authState}/>
            <div className={'content'}>
                <Title name={"Sign Up"}/>
                <Divider/>
                <SignupForm setError={setError}/>
                {
                    error == null ? <></> : <Error error={error}/>
                }
                <button className={'button'} onClick={(event) => {
                    event.preventDefault();
                    auth.signInAnonymously()
                        .then(() => {
                            // Signed in..
                            const unsubscribe = auth.onAuthStateChanged((user) => {
                                const authStateChanged = async (user) => {
                                    if (user) {
                                        // User is signed in, see docs for a list of available properties
                                        // https://firebase.google.com/docs/reference/js/firebase.User
                                        const userDoc = db.collection("users").doc(user.uid);
                                        await userDoc.set({
                                            username: 'Anonymous User',
                                            currentMatchID: null
                                        }).then(() => {
                                            console.log("Document successfully written!");
                                            window.location.replace("/")
                                        })
                                        .catch((error) => {
                                            console.error("Error writing document: ", error);
                                        });
                                        // ...
                                    } else {
                                        // User is signed out
                                        // ...
                                        console.log("should never happen");
                                    }
                                }
                                authStateChanged(user).then(() => unsubscribe());
                            });
                        }).catch((error) => {
                        setError(error.message);
                    })

                }}>Or... Sign Up Anonymously</button>
            </div>
        </div>

    );
}
