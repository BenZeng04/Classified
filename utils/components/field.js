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
const grid_scale = 70;
let grid = {};

function map(x, y) {
    return x * height + y;
}

class Field extends React.Component {

    setup(p5, canvasParentRef) {
        p5.createCanvas(grid_scale * width, grid_scale * height).parent(canvasParentRef);
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.textStyle(p5.BOLD)
    };

    draw(p5) {
        p5.strokeWeight(7);
        for(let i = 0; i <= width; i++) {
            p5.line(i * grid_scale, 0, i * grid_scale, grid_scale * height);
        }
        for(let i = 0; i <= height; i++) {
            p5.line(0, i * grid_scale, grid_scale * width, i * grid_scale);
        }

        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                if(grid[map(i, j)]) {
                    p5.ellipse(i * grid_scale + grid_scale / 2, j * grid_scale + grid_scale / 2, grid_scale / 2, grid_scale / 2)
                    p5.text(grid[map(i, j)], i * grid_scale + grid_scale / 2, j * grid_scale + grid_scale / 2)
                }
            }
        }
    };

    componentDidMount() {
        const Sketch = require("react-p5");
        db.collection("games").doc("SingleGameTest")
            .onSnapshot((doc) => {
                if(doc.exists) {
                    grid = doc.data().grid;
                }
            });
        ReactDOM.render(<Sketch setup={this.setup} draw={this.draw}/>, document.getElementById("sketch"))
    }

    render() {

        return <div style={centre} id={"sketch"}/>;
    }
}

export default Field;