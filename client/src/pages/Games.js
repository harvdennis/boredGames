import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './../styles/games.css';
import chess from './game-imgs/chess.PNG';
import connect4 from './game-imgs/connect4.PNG';
import battleship from './game-imgs/battleship.PNG';

class Games extends Component {
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
                <div className="gameGrid">
                    <div className="gameSelector">
                        <Link to="/games/chess" className="game-link">
                            <div className="selector">
                                <img src={chess} alt="chess" className="selector-img" />
                                <h3>Chess</h3>
                            </div>
                        </Link>
                    </div>
                    <div className="gameSelector">
                        <Link to="/games/connect" className="game-link">
                            <div className="selector">
                                <img src={connect4} alt="connect4" className="selector-img" />
                                <h3>Connect 4</h3>
                            </div>
                        </Link>
                    </div>
                    <div className="gameSelector">
                        <Link to="/games/battle" className="game-link">
                            <div className="selector">
                                <img src={battleship} alt="connect4" className="selector-img" />
                                <h3>Battleships</h3>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default Games;
