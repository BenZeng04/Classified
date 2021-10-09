import React from "react";

import {ActionHandler} from "../../gameplay/actions/actionHandler";
import {GameState} from "../../gameplay/states/gameState";
import {GameLoader} from "../../gameplay/database/gameLoader";
import {Renderer} from "../../gameplay/graphics/renderer";
import {width, height} from "../../gameplay/graphics/renderer";

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

        const loader = new GameLoader(auth, this.game, this.handler);
        loader.onGameStart(() => {
            this.props.startGame();
            this.setState({started: true});
        });
        loader.loadAndListen()
    }

    render() {
        if (this.state.started) {
            const Sketch = require("react-p5");
            const graphics = new Renderer(this.game, this.handler);
            return <div style={{
                height: '100%',
                width: '100%',
            }} tabIndex='8'>
                <Sketch style={{
                    height: '100%',
                    width: '100%',
                    transformOrigin: `0 0`,
                    transform: `scale(${0.825 * innerWidth / width})`,
                }} preload={(p5) => graphics.preload(p5)} setup={(p5, cpr) => graphics.setup(p5, cpr)} draw={(p5) => graphics.draw(p5)}/>
            </div>;
        } else {
            return <></>;
        }
    }
}

export default Field;