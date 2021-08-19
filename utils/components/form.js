import React from "react";
import * as ReactDOM from "react-dom";
import {db} from "../firebase/firebase";

const centre = {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
}

const width = 5;
const height = 6;

function map(x, y) {
    return x * height + y;
}

const inputDiv = {
    marginBottom: '10px'
}

const titleStyle = {
    textAlign: 'center'
}

const inputStyle = {
    width: '50%',
    marginLeft: '25%',
}

const submit = {
    width: '20%',
    marginLeft: '55%'
}


class Form extends React.Component {
    componentDidMount() {
        document.getElementById("addCircle").addEventListener('submit', (evt) => {
            evt.preventDefault();
            var x = document.getElementById("x").value;
            var y = document.getElementById("y").value;
            db.collection("games").doc("SingleGameTest")
                .get().then((doc) => {
                    if(doc.exists) {
                        var idx = map(parseInt(x), parseInt(y));
                        var val = doc.data().grid[idx];
                        if(!val) val = 0;
                        val++;
                        var usersUpdate = {};
                        usersUpdate[`grid.${idx}`] = val;
                        db.collection("games").doc("SingleGameTest").update(usersUpdate);
                    }
                });
        })
    }

    render() {
        return <form id={"addCircle"}>
            <div style={inputDiv}><input style={inputStyle} type="number" id="x" name="x"
                                         placeholder="x:"/></div>
            <div style={inputDiv}><input style={inputStyle} type="number" id="y" name="y"
                                         placeholder="y:"/></div>
            <input style={submit} type="submit" value="Submit"/>
        </form>;
    }
}


export default Form;