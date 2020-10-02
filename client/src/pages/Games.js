import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './../styles/games.css';
import chess from './game-imgs/chess.PNG';

class Games extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="gamesBG">
                <nav>
                    <ul>
                        <li>
                            <Link to="/app">
                                <h3 className="pageTitle ">boredGames</h3>
                            </Link>
                        </li>
                        <li></li>
                    </ul>
                </nav>
                <div className="gameSelector">
                    <Link to="/games/chess" className="game-link">
                        <div className="selector">
                            <img src={chess} alt="chess" className="selector-img" />
                            <h3>Chess</h3>
                        </div>
                    </Link>
                </div>
            </div>
        );
    }
}

export default Games;
