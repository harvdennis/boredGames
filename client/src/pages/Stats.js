import React, { Component } from 'react'; //react and react component imported from react library
import { Link } from 'react-router-dom';
import './../styles/games.css';
import './../styles/App.css'; //styles imported

import PropTypes from 'prop-types'; //proptypes imported
import { connect } from 'react-redux'; //conncet imported so react can speak with redux

export class Stats extends Component {
    render() {
        function round(value, precision) {
            //simple number rounding function
            var multiplier = Math.pow(10, precision || 0);
            return Math.round(value * multiplier) / multiplier; //the math round funtion rounds to the nearest whole number so I had to code my own
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
                        {/*rounds time to 2 decimal places*/}
                        <h3 className="stat">Games Won: {this.props.stats.chess.gamesWon}</h3>
                        <h3 className="stat">Win Loss Ratio: {round(this.props.stats.chess.gamesWon / this.props.stats.chess.gamesPlayed, 3)}</h3>
                        {/*rounds ratio to 3 decimal places*/}
                        <h3 className="stat">Average Time Per Match: {round(this.props.stats.chess.hoursPlayed / this.props.stats.chess.gamesPlayed / 60, 2)} Minutes</h3>
                        {/*rounds time to 2 decimal places*/}
                        <h3 className="stat">Average Time Per Win: {round(this.props.stats.chess.winTimes / this.props.stats.chess.gamesWon / 60, 2)} Minutes</h3>
                        {/*rounds time to 2 decimal places*/}
                    </div>
                </div>
                <div className="contain">
                    <h3>Connect 4</h3>
                    <div className="divider"></div>
                    <div className="statsList">
                        <h3 className="stat">Games Played: {this.props.stats.connect4.gamesPlayed}</h3>
                        <h3 className="stat">Hours Played: {round(this.props.stats.connect4.hoursPlayed / 60 / 60, 2)} Hrs</h3>
                        <h3 className="stat">Games Won: {this.props.stats.connect4.gamesWon}</h3>
                        <h3 className="stat">Win Loss Ratio: {round(this.props.stats.connect4.gamesWon / this.props.stats.connect4.gamesPlayed, 3)}</h3>
                        {/*rounds ratio to 3 decimal places*/}
                        <h3 className="stat">Average Time Per Match: {round(this.props.stats.connect4.hoursPlayed / this.props.stats.connect4.gamesPlayed / 60, 2)} Minutes</h3>
                        <h3 className="stat">Average Time Per Win: {round(this.props.stats.connect4.winTimes / this.props.stats.connect4.gamesWon / 60, 2)} Minutes</h3>
                        {/*rounds time to 2 decimal places*/}
                    </div>
                </div>
                <div className="contain">
                    <h3>Battleships</h3>
                    <div className="divider"></div>
                    <div className="statsList">
                        <h3 className="stat">Games Played: {this.props.stats.battleships.gamesPlayed}</h3>
                        <h3 className="stat">Hours Played: {round(this.props.stats.battleships.hoursPlayed / 60 / 60, 2)} Hrs</h3>
                        <h3 className="stat">Games Won: {this.props.stats.battleships.gamesWon}</h3>
                        <h3 className="stat">Win Loss Ratio: {round(this.props.stats.battleships.gamesWon / this.props.stats.battleships.gamesPlayed, 3)}</h3>
                        {/*rounds ratio to 3 decimal places*/}
                        <h3 className="stat">
                            Average Time Per Match: {round(this.props.stats.battleships.hoursPlayed / this.props.stats.battleships.gamesPlayed / 60, 2)} Minutes
                        </h3>
                        <h3 className="stat">Average Time Per Win: {round(this.props.stats.battleships.winTimes / this.props.stats.battleships.gamesWon / 60, 2)} Minutes</h3>
                        {/*rounds time to 2 decimal places*/}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    //maps the redux state to the components props
    user: state.user,
    stats: state.statistics.stats,
});

Stats.propTypes = {
    //defines the types of each prop so no unwanted errors occur
    user: PropTypes.object.isRequired,
    statistics: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(Stats); //connect links react and redux together so they can be used together
