import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { setOpponent } from '../../redux/actions/opponentActions';
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
            onlinePlayers: 0,
            roomCode: '',
        };
    }

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
        socket = io('http://192.168.1.106:5000' || 'http://localhost:5000');

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
            this.setState({ joinedMatch: true });
            this.setState({ matchRoom: room });
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
            console.log(move);
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

    gameOver(board) {
        let yellow;
        let red;
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 6; j++) {
                if (board[i][j] === 1) {
                    red++;
                } else {
                    red = 0;
                }

                if (board[i][j] === 2) {
                    yellow++;
                } else {
                    yellow = 0;
                }

                if (yellow >= 4) {
                    console.log('yellow wins');
                }
                if (red >= 4) {
                    console.log('red wins');
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
                    console.log('yellow wins');
                }
                if (red >= 4) {
                    console.log('red wins');
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
                <div style={{ textAlign: 'center' }}>
                    {this.state.user && !this.state.loading && (
                        <button className="btn" onClick={newGame}>
                            Find Match
                        </button>
                    )}
                    {this.state.user && this.state.loading && (
                        <button className="btn" onClick={stopSearch}>
                            Cancel search
                        </button>
                    )}
                    {this.state.loading && <h3 className="load">Loading...</h3>}
                    <h4 style={{ marginBottom: '1rem' }}>Players online: {this.state.onlinePlayers}</h4>
                </div>
            );
        }
    }
}

const mapStateToProps = (state) => ({
    user: state.user,
    opponent: state.opponent,
});

Connectgame.propTypes = {
    user: PropTypes.object.isRequired,
    opponent: PropTypes.object.isRequired,
    setOpponent: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { setOpponent })(Connectgame);
