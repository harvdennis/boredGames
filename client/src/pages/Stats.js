import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './../styles/games.css';
import './../styles/App.css';
import chess from './game-imgs/chess.PNG';
import connect4 from './game-imgs/connect4.PNG';
import battleship from './game-imgs/battleship.PNG';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

export class Stats extends Component {
    render() {
        function round(value, precision) {
            var multiplier = Math.pow(10, precision || 0);
            return Math.round(value * multiplier) / multiplier;
        }
        return (
            <div className="BG">
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
                <div className="contain">
                    <h3 className="popGames">Chess</h3>
                    <div className="divider"></div>
                    <div className="statsList">
                        <h3 className="stat">Games Played: {this.props.stats.chess.gamesPlayed}</h3>
                        <h3 className="stat">Hours Played: {round(this.props.stats.chess.hoursPlayed / 60 / 60, 2)} Hrs</h3>
                        <h3 className="stat">Games Won: {this.props.stats.chess.gamesWon}</h3>
                        <h3 className="stat">Win Loss Ratio: {this.props.stats.chess.gamesWon / this.props.stats.chess.gamesPlayed}</h3>
                        <h3 className="stat">Average Time Per Match: {this.props.stats.chess.hoursPlayed / this.props.stats.chess.gamesPlayed} seconds</h3>
                        <h3 className="stat">Average Time Per Win: {this.props.stats.chess.winTimes / this.props.stats.chess.gamesWon} seconds</h3>
                    </div>
                </div>
                <div className="contain">
                    <h3>Connect 4</h3>
                    <div className="divider"></div>
                    <div className="statsList">
                        <h3 className="stat">Games Played: {this.props.stats.connect4.gamesPlayed}</h3>
                        <h3 className="stat">Hours Played: {round(this.props.stats.connect4.hoursPlayed / 60 / 60, 2)} Hrs</h3>
                        <h3 className="stat">Games Won: {this.props.stats.connect4.gamesWon}</h3>
                        <h3 className="stat">Win Loss Ratio: {this.props.stats.connect4.gamesWon / this.props.stats.connect4.gamesPlayed}</h3>
                        <h3 className="stat">Average Time Per Match: {this.props.stats.connect4.hoursPlayed / this.props.stats.connect4.gamesPlayed} seconds</h3>
                        <h3 className="stat">Average Time Per Win: {this.props.stats.connect4.winTimes / this.props.stats.connect4.gamesWon} seconds</h3>
                    </div>
                </div>
                <div className="contain">
                    <h3>Battleships</h3>
                    <div className="divider"></div>
                    <div className="statsList">
                        <h3 className="stat">Games Played: {this.props.stats.battleships.gamesPlayed}</h3>
                        <h3 className="stat">Hours Played: {round(this.props.stats.battleships.hoursPlayed / 60 / 60, 2)} Hrs</h3>
                        <h3 className="stat">Games Won: {this.props.stats.battleships.gamesWon}</h3>
                        <h3 className="stat">Win Loss Ratio: {this.props.stats.battleships.gamesWon / this.props.stats.battleships.gamesPlayed}</h3>
                        <h3 className="stat">Average Time Per Match: {this.props.stats.battleships.hoursPlayed / this.props.stats.battleships.gamesPlayed} seconds</h3>
                        <h3 className="stat">Average Time Per Win: {this.props.stats.battleships.winTimes / this.props.stats.battleships.gamesWon} seconds</h3>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    user: state.user,
    stats: state.statistics.stats,
});

Stats.propTypes = {
    user: PropTypes.object.isRequired,
    statistics: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(Stats);
