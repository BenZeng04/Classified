import firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/auth';
import * as ReactDOM from "react-dom";
import Head from "next/head";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAa03x15i-xEXj1yS4O4CzovvENpNNfci8",
    authDomain: "classified-9efdc.firebaseapp.com",
    projectId: "classified-9efdc",
    storageBucket: "classified-9efdc.appspot.com",
    messagingSenderId: "314607472937",
    appId: "1:314607472937:web:37d58d7b4b9ce7145de738",
    measurementId: "G-C04PK5JQ9W"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export default firebase;

/**
 * Re-renders an HTML element by its id. Listeners will have to be re-attached after calling this method.
 * @param pageID
 * @param DOMElement
 */
export function rerender(pageID, DOMElement) {
    ReactDOM.render(DOMElement, document.getElementById(pageID));
}
