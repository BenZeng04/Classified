import React from "react";

import {ActionHandler} from "../../gameplay/actions/actionHandler";
import {GameState} from "../../gameplay/states/gameState";
import {GameLoader} from "../../gameplay/database/gameLoader";
import {ClassifiedSketch, width} from "../../gameplay/graphics/classifiedSketch";

/**
 * !important
 * DO NOT USE authInfo.matchData FOR IN-GAME MATCH DATA! IT IS HIGHLY LIKELY TO NOT BE UPDATED.
 */

class Field extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            started: false
        }
    }

    componentDidMount() {
        const auth = this.props.authInfo;
        this.game = new GameState();
        this.handler = new ActionHandler(this.game);

        this.loader = new GameLoader(auth, this.game, this.handler);
        this.loader.onGameStart(() => {
            this.props.startGame();
            this.setState({started: true});
        });
        this.loader.loadAndListen();
    }

    render() {
        if (this.state.started) {
            const Sketch = require("react-p5");
            const graphics = new ClassifiedSketch(this.game, this.handler, this.loader);
            return <div style={{
                height: '100%',
                width: '100%',
            }} tabIndex='8'>
                <Sketch style={{
                    height: '100%',
                    width: '100%',
                    transformOrigin: `0 0`,
                    transform: `scale(${0.825 * innerWidth / width})`,
                }} preload={(p5) => graphics.preload(p5)} setup={(p5, cpr) => graphics.setup(p5, cpr)}
                        draw={(p5) => graphics.draw(p5)} mousePressed={(p5, evt) => {graphics.mousePressed(p5, evt)}}/>
            </div>;
        } else {
            return <></>;
        }
    }
}

export default Field;