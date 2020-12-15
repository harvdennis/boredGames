import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { setOpponent } from '../../redux/actions/opponentActions';
import { setUserStats, getUserStats } from '../../redux/actions/userActions';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ConnectBoard from './ConnectBoard';
import './connectboard.css';

let socket;

class Connectgame extends Component {
    constructor() {
        super();

        this.state = {
            currentBoard: null,
            user: null,
            opponent: {},
            joinedRoom: false,
            joinedMatch: false,
            matchRoom: null,
            player: null,
            myMove: null,
            loading: false,
            lost: false,
            won: false,
            draw: false,
            startTime: null,
            movesMade: 0,
            onlinePlayers: 0,
            roomCode: '',
        };
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    customGame = (e) => {
        e.preventDefault();
        let room = this.state.code;
        if (this.state.joinedRoom) {
            const user = this.state.user;
            socket.emit('waiting', { user, room });
        }
    };

    componentDidUpdate(prevProps) {
        if (this.props.user.credentials.handle !== prevProps.user.credentials.handle) {
            socket.emit('disconnected');
            const user = this.props.user.credentials.handle;
            const room = 'connect';
            console.log(`${user} joining ${room}`);
            socket.emit('joinRoom', { user, room });
            this.setState({ user: this.props.user.credentials.handle });
        }
    }

    componentDidMount() {
        socket = io('http://192.168.1.106:5000' || 'http://localhost:5000'); //use when developing
        //socket = io(); // use when deploying to heroku

        if (this.props.user.credentials.handle) {
            const user = this.props.user.credentials.handle;
            const room = 'connect';
            console.log(`${user} joining ${room}`);
            socket.emit('joinRoom', { user, room });
            this.setState({ user: this.props.user.credentials.handle });
        }

        socket.on('joinedRoom', (data) => {
            this.setState({ joinedRoom: data });
            console.log(`joined ${data}`);
        });

        socket.on('loading', (data) => {
            this.setState({ loading: data });
        });

        socket.on('joinedMatch', (room) => {
            this.setState({
                currentBoard: [
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                ],
            });
            let time = new Date();
            this.setState({ startTime: time });
            this.setState({ joinedMatch: true });
            this.setState({ matchRoom: room });
            this.props.getUserStats();
            console.log(`joined match ${room}`);
        });

        socket.on('player', (player) => {
            this.setState({ player: player.colour });
            this.gameOpponent(player.opp);
            if (player.colour === 'white') {
                this.setState({ myMove: true });
            } else {
                this.setState({ myMove: false });
            }
        });

        socket.on('sendMove', (move) => {
            this.onlineMove(move);
            this.gameOver(move);
        });

        socket.on('numOnline', (num) => {
            this.setState({ onlinePlayers: num });
        });
    }

    componentWillUnmount() {
        socket.emit('disconnected');
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    gameOpponent(user) {
        this.props.setOpponent(user);
    }

    onlineMove(move) {
        this.setState({ currentBoard: move });
        this.setState({ myMove: true });
        console.log('moved');
    }

    updateStats(win) {
        let finalTime = new Date();
        let elapsed = (finalTime.getTime() - this.state.startTime.getTime()) / 1000;
        let placeholder = this.props.stats;
        placeholder.connect4.gamesPlayed = placeholder.connect4.gamesPlayed + 1;
        placeholder.connect4.hoursPlayed = placeholder.connect4.hoursPlayed + elapsed;
        placeholder.connect4.movesMade = placeholder.connect4.movesMade + this.state.movesMade;
        if (win) {
            placeholder.connect4.gamesWon = placeholder.connect4.gamesWon + 1;
            placeholder.connect4.winTimes = placeholder.connect4.winTimes + elapsed;
            placeholder.connect4.winMoves = placeholder.connect4.winMoves + this.state.movesMade;
            placeholder.recent.winLoss = 'Win';
        } else {
            placeholder.recent.winLoss = 'Loss';
        }
        placeholder.recent.game = 'Connect 4';
        placeholder.recent.movesMade = this.state.movesMade;
        placeholder.recent.opponent = this.props.opponent.opponent.handle;
        placeholder.recent.timePlayed = elapsed;

        this.props.setUserStats(placeholder);
    }

    gameOver(board) {
        let yellow;
        let red;
        let count;
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 6; j++) {
                if (board[i][j] === 1) {
                    red++;
                    count++;
                } else {
                    red = 0;
                }

                if (board[i][j] === 2) {
                    yellow++;
                    count++;
                } else {
                    yellow = 0;
                }

                if (yellow >= 4) {
                    if (this.state.player === 'black') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
                if (red >= 4) {
                    if (this.state.player === 'white') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
                if (count >= 42) {
                    this.setState({ draw: true });
                    this.setState({ myMove: false });
                    this.updateStats(false);
                }
            }
        }

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                if (board[j][i] === 1) {
                    red++;
                } else {
                    red = 0;
                }

                if (board[j][i] === 2) {
                    yellow++;
                } else {
                    yellow = 0;
                }

                if (yellow >= 4) {
                    if (this.state.player === 'black') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
                if (red >= 4) {
                    if (this.state.player === 'white') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
            }
        }

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 7; j++) {
                if (i + j >= 6) {
                    break;
                }

                if (board[j][i + j] === 1) {
                    red++;
                } else {
                    red = 0;
                }

                if (board[j][i + j] === 2) {
                    yellow++;
                } else {
                    yellow = 0;
                }

                if (yellow >= 4) {
                    if (this.state.player === 'black') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
                if (red >= 4) {
                    if (this.state.player === 'white') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
            }
        }

        for (let i = 1; i < 4; i++) {
            for (let j = 0; j < 7; j++) {
                if (i + j >= 7) {
                    break;
                }

                if (board[i + j][j] === 1) {
                    red++;
                } else {
                    red = 0;
                }

                if (board[i + j][j] === 2) {
                    yellow++;
                } else {
                    yellow = 0;
                }

                if (yellow >= 4) {
                    if (this.state.player === 'black') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
                if (red >= 4) {
                    if (this.state.player === 'white') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
            }
        }

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 7; j++) {
                if (i + j >= 6) {
                    break;
                }

                if (board[5 - j][i + j] === 1) {
                    red++;
                } else {
                    red = 0;
                }

                if (board[5 - j][i + j] === 2) {
                    yellow++;
                } else {
                    yellow = 0;
                }

                if (yellow >= 4) {
                    if (this.state.player === 'black') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
                if (red >= 4) {
                    if (this.state.player === 'white') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
            }
        }

        for (let i = 1; i < 4; i++) {
            for (let j = 0; j < 7; j++) {
                if (i + j >= 7) {
                    break;
                }

                if (board[6 - (i + j)][j] === 1) {
                    red++;
                } else {
                    red = 0;
                }

                if (board[6 - (i + j)][j] === 2) {
                    yellow++;
                } else {
                    yellow = 0;
                }

                if (yellow >= 4) {
                    if (this.state.player === 'black') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
                if (red >= 4) {
                    if (this.state.player === 'white') {
                        this.setState({ won: true });
                        this.setState({ myMove: false });
                        this.updateStats(true);
                    } else {
                        this.setState({ lost: true });
                        this.setState({ myMove: false });
                        this.updateStats(false);
                    }
                }
            }
        }
    }

    render() {
        const newGame = () => {
            if (this.state.joinedRoom) {
                const user = this.state.user;
                const room = 'connect';
                socket.emit('waiting', { user, room });
            }
        };

        const stopSearch = () => {
            if (this.state.joinedRoom) {
                const user = this.state.user;
                const room = 'connect';
                socket.emit('stopSearch', { user, room });
            }
        };

        const makeRoom = () => {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < 6; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            this.setState({ customRoom: result });
        };

        const handleClick = (e) => {
            let targetCol = e.target.id;
            let matchRoom = this.state.matchRoom;
            let colour;
            let allowMove = false;
            if (this.state.player === 'white') {
                colour = 1;
            } else {
                colour = 2;
            }
            targetCol = parseInt(targetCol);
            let currentmove = this.state.currentBoard;
            for (let i = 5; i >= 0; i--) {
                if (currentmove[targetCol][i] === 0) {
                    currentmove[targetCol][i] = colour;
                    allowMove = true;
                    break;
                }
            }

            if (this.state.myMove && allowMove) {
                this.setState({ movesMade: this.state.movesMade + 1 });
                socket.emit('sendMove', { currentmove, matchRoom });
                this.setState({ currentBoard: currentmove });
                this.setState({ myMove: false });
                this.gameOver(currentmove);
            }
        };
        if (this.state.joinedMatch) {
            return (
                <div>
                    <div className="boardContainer">
                        <ul className="playerDetails">
                            <li>
                                <img src={this.props.opponent.opponent.imageUrl} alt="icon" className="gameIcon" />
                            </li>
                            <li>
                                <a className="gameHandle"> {this.props.opponent.opponent.handle}</a>
                            </li>
                        </ul>
                        <div className="interactive">
                            <div className="clickDetect">
                                <div className="clicker" id="0col" onClick={handleClick}></div>
                                <div className="clicker" id="1col" onClick={handleClick}></div>
                                <div className="clicker" id="2col" onClick={handleClick}></div>
                                <div className="clicker" id="3col" onClick={handleClick}></div>
                                <div className="clicker" id="4col" onClick={handleClick}></div>
                                <div className="clicker" id="5col" onClick={handleClick}></div>
                                <div className="clicker" id="6col" onClick={handleClick}></div>
                            </div>
                            <ConnectBoard currentBoard={this.state.currentBoard} />
                        </div>
                        <ul className="playerDetails">
                            <li>
                                <img src={this.props.user.credentials.imageUrl} alt="icon" className="gameIcon" />
                            </li>
                            <li>
                                <a className="gameHandle"> {this.props.user.credentials.handle}</a>
                            </li>
                        </ul>
                    </div>
                    {this.state.won && (
                        <div className="endScreen">
                            <h3>You Won</h3>
                            <Link to="/games" className="btn">
                                Back to games
                            </Link>
                        </div>
                    )}
                    {this.state.draw && (
                        <div className="endScreen">
                            <h3>Draw</h3>
                            <Link to="/games" className="btn">
                                Back to games
                            </Link>
                        </div>
                    )}
                    {this.state.lost && (
                        <div className="endScreen">
                            <h3>You Lost</h3>
                            <Link to="/games" className="btn">
                                Back to games
                            </Link>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div style={{ textAlign: 'center' }} className="BG">
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
                    <h3 className="popGames">Connect</h3>
                    <div className="divider"></div>
                    {this.state.user && !this.state.loading && (
                        <div>
                            <button className="btn" onClick={newGame}>
                                Find Match
                            </button>
                        </div>
                    )}
                    {this.state.user && this.state.loading && (
                        <button className="btn" onClick={stopSearch}>
                            Cancel search
                        </button>
                    )}
                    {this.state.loading && <h3 className="load">Loading...</h3>}
                    <h4 style={{ marginBottom: '1rem', color: 'white' }}>Players online: {this.state.onlinePlayers}</h4>

                    <div>
                        <h3 className="popGames">Custom Match</h3>
                        <button className="btn" onClick={makeRoom}>
                            Generate Code
                        </button>
                        {this.state.customRoom && <h3>{this.state.customRoom}</h3>}
                        <div className="inputCode">
                            <form noValidate onSubmit={this.customGame}>
                                <input value={this.state.users} id="code" type="text" name="code" className="input" placeholder="input code" onChange={this.handleChange} />
                                <button type="submit" className="btn">
                                    Join
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

const mapStateToProps = (state) => ({
    user: state.user,
    opponent: state.opponent,
    stats: state.statistics.stats,
});

Connectgame.propTypes = {
    user: PropTypes.object.isRequired,
    statistics: PropTypes.object.isRequired,
    opponent: PropTypes.object.isRequired,
    setOpponent: PropTypes.func.isRequired,
    setUserStats: PropTypes.func.isRequired,
    getUserStats: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { setOpponent, setUserStats, getUserStats })(Connectgame);
