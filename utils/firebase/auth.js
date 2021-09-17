import {useEffect, useState} from 'react'
import {auth, db} from './Firebase';

export const NOT_STARTED = true;
export const FINISHED = false;


export default function useFirebaseAuth() {
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(NOT_STARTED);
    const [currentMatchID, setCurrentMatchID] = useState(null);
    const [matchData, setMatchData] = useState(null);
    const [userData, setUserData] = useState(null);
// listen for Firebase state change
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authState) => {
            const authStateChanged = async (authState) => {
                if (!authState) {
                    setAuthUser(null)
                    setLoading(FINISHED)
                    return;
                }
                const userData = (await db.collection("users").doc(authState.uid).get()).data();
                const ID = userData.currentMatchID;

                if (ID != null) {
                    const matchData = (await db.collection("games").doc(ID).get()).data();
                    setMatchData(matchData);
                }
                setCurrentMatchID(ID);
                setAuthUser(authState);
                setUserData(userData);
                setLoading(FINISHED);
            }
            authStateChanged(authState).then(() => unsubscribe());
        });
    }, []);
    return {
        authUser: authUser,
        loading: loading,
        currentMatchID: currentMatchID,
        matchData: matchData,
        userData: userData
    };
}