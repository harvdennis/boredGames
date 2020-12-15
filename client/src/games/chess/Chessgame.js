import React, { Component } from 'react';
import Chessboard from './chessboard';
import './chessboard.css';
import { Link } from 'react-router-dom';
import { setOpponent } from '../../redux/actions/opponentActions';
import { setUserStats, getUserStats } from '../../redux/actions/userActions';

import io from 'socket.io-client';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Chess = require('chess.js');

let socket;

class Chessgame extends Component {
    constructor() {
        super();
        this.chess = null;
        this.checkingMove = null;

        this.state = {
            getPeice: null,
            targetPanel: null,
            targetPeice: null,
            peicePanel: null,
            currentFen: null,
            user: null,
            opponent: {},
            joinedRoom: false,
            joinedMatch: false,
            matchRoom: null,
            player: null,
            loading: false,
            promo: false,
            prevMove: null,
            lost: false,
            won: false,
            draw: false,
            startTime: null,
            movesMade: 0,
            inCheck: false,
            onlinePlayers: 0,
            roomCode: '',
            customRoom: null,
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
            const room = 'chess';
            console.log(`${user} joining ${room}`);
            socket.emit('joinRoom', { user, room });
            this.setState({ user: this.props.user.credentials.handle });
        }
    }

    componentDidMount() {
        socket = io('http://192.168.1.106:5000' || 'http://localhost:5000'); //use when developing

        //socket = io(); //use when deploying to heroku

        if (this.props.user.credentials.handle) {
            const user = this.props.user.credentials.handle;
            const room = 'chess';
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
            this.chess = new Chess();
            this.checkingMove = new Chess();
            let time = new Date();
            this.setState({ startTime: time });
            this.setState({ currentFen: this.chess.fen() });
            this.setState({ joinedMatch: true });
            this.setState({ matchRoom: room });
            this.props.getUserStats();
            console.log(`joined match ${room}`);
        });

        socket.on('player', (player) => {
            this.setState({ player: player.colour });
            this.gameOpponent(player.opp);
        });

        socket.on('sendMove', (move) => {
            this.onlineMove(move);
            this.gameOver(this.chess);
            this.check(this.chess);
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
        this.chess.load(move);
        this.setState({ currentFen: move });
        console.log('moved');
    }

    formatMove(fromPan, coords) {
        fromPan = fromPan.split('-');
        fromPan[0] = parseInt(fromPan[0]);
        fromPan[1] = parseInt(fromPan[1]);
        coords = coords.split('-');
        coords[0] = parseInt(coords[0]);
        coords[1] = parseInt(coords[1]);

        return { fromPan, coords };
    }

    checkMove(fen) {
        let fenArr = fen.split(' ');
        if (this.state.player === 'black') {
            if (fenArr[1] === 'w') {
                return false;
            } else {
                return true;
            }
        } else {
            if (fenArr[1] === 'b') {
                return false;
            } else {
                return true;
            }
        }
    }

    highlightPanels(peicePanel) {
        const xAxis = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const yAxis = ['8', '7', '6', '5', '4', '3', '2', '1'];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.checkingMove.load(this.state.currentFen);
                let { fromPan, coords } = this.formatMove(peicePanel, `${i}-${j}`);
                let shouldHightlight = this.checkingMove.move({
                    from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`,
                    to: `${xAxis[coords[0]]}${yAxis[coords[1]]}`,
                });
                if (shouldHightlight) {
                    let panel = document.getElementById(`${i}-${j}`).firstElementChild;
                    panel.classList.add('highlighted');
                } else {
                    let panel = document.getElementById(`${i}-${j}`).firstElementChild;
                    panel.classList.remove('highlighted');
                }
            }
        }
    }

    updateStats(win) {
        let finalTime = new Date();
        let elapsed = (finalTime.getTime() - this.state.startTime.getTime()) / 1000;
        let placeholder = this.props.stats;
        placeholder.chess.gamesPlayed = placeholder.chess.gamesPlayed + 1;
        placeholder.chess.hoursPlayed = placeholder.chess.hoursPlayed + elapsed;
        placeholder.chess.movesMade = placeholder.chess.movesMade + this.state.movesMade;
        if (win) {
            placeholder.chess.gamesWon = placeholder.chess.gamesWon + 1;
            placeholder.chess.winTimes = placeholder.chess.winTimes + elapsed;
            placeholder.chess.winMoves = placeholder.chess.winMoves + this.state.movesMade;
            placeholder.recent.winLoss = 'Win';
        } else {
            placeholder.recent.winLoss = 'Loss';
        }
        placeholder.recent.game = 'Chess';
        placeholder.recent.movesMade = this.state.movesMade;
        placeholder.recent.opponent = this.props.opponent.opponent.handle;
        placeholder.recent.timePlayed = elapsed;

        this.props.setUserStats(placeholder);
    }

    gameOver(chess) {
        if (chess.in_checkmate()) {
            let loser = chess.fen().split(' ')[1];
            if (loser === 'w') {
                if (this.state.player === 'white') {
                    this.setState({ lost: true });
                    this.updateStats(false);
                } else {
                    this.setState({ won: true });
                    this.updateStats(true);
                }
            } else if (loser === 'b') {
                if (this.state.player === 'black') {
                    this.setState({ lost: true });
                    this.updateStats(false);
                } else {
                    this.setState({ won: true });
                    this.updateStats(true);
                }
            }
        } else if (chess.in_draw()) {
            this.setState({ draw: true });
            this.updateStats(false);
        } else if (chess.in_stalemate()) {
            this.setState({ draw: true });
            this.updateStats(false);
        }
    }

    check(chess) {
        if (chess.in_check()) {
            this.setState({ inCheck: true });
            setTimeout(() => {
                this.setState({ inCheck: false });
            }, 2500);
        }
    }

    choosePromo(peice) {
        this.chess.move({
            from: this.state.prevMove[0],
            to: this.state.prevMove[1],
            promotion: peice,
        });
        this.setState({ promo: false });
        let currentmove = this.chess.fen();
        let matchRoom = this.state.matchRoom;
        socket.emit('sendMove', { currentmove, matchRoom });
        this.setState({ currentFen: this.chess.fen() });
    }

    checkPromo(fromPan) {
        const xAxis = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const yAxis = ['8', '7', '6', '5', '4', '3', '2', '1'];
        let isPawn = this.chess.get(`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`);
        if (fromPan[1] === 1 && isPawn.type === 'p' && isPawn.color === 'w') {
            this.setState({ promo: true });
            return true;
        } else if (fromPan[1] === 6 && isPawn.type === 'p' && isPawn.color === 'b') {
            this.setState({ promo: true });
            return true;
        } else {
            return false;
        }
    }

    render() {
        const xAxis = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const yAxis = ['8', '7', '6', '5', '4', '3', '2', '1'];
        const newGame = () => {
            if (this.state.joinedRoom) {
                const user = this.state.user;
                const room = 'chess';
                socket.emit('waiting', { user, room });
            }
        };

        const stopSearch = () => {
            if (this.state.joinedRoom) {
                const user = this.state.user;
                const room = 'chess';
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

        const getPeice = (e) => {
            let targetPeice;
            let peicePanel;
            const xAxis = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const yAxis = ['8', '7', '6', '5', '4', '3', '2', '1'];

            targetPeice = e.target.id;
            peicePanel = e.target.parentNode.parentNode.parentNode.id;
            targetPeice = parseInt(targetPeice);
            this.highlightPanels(peicePanel);
            if (this.state.targetPeice !== null) {
                let { fromPan, coords } = this.formatMove(this.state.peicePanel, peicePanel);
                if (this.checkPromo(fromPan)) {
                    if (this.state.promotionTo !== null) {
                        this.chess.move({
                            from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`,
                            to: `${xAxis[coords[0]]}${yAxis[coords[1]]}`,
                        });
                        this.highlightPanels(peicePanel);
                        this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] });
                    }
                } else {
                    this.chess.move({ from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, to: `${xAxis[coords[0]]}${yAxis[coords[1]]}` });
                    this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] });
                }

                let currentmove = this.chess.fen();
                let matchRoom = this.state.matchRoom;
                if (this.state.currentFen !== this.chess.fen()) {
                    this.setState({ movesMade: this.state.movesMade + 1 });
                    socket.emit('sendMove', { currentmove, matchRoom });
                }
                this.setState({ currentFen: this.chess.fen() });
                this.setState({ targetPeice });
                this.setState({ peicePanel });
            } else {
                this.setState({ targetPeice });
                this.setState({ peicePanel });
            }
            this.gameOver(this.chess);
            this.check(this.chess);
        };

        const handleDrag = (e) => {
            const { destination, source, draggableId } = e;
            if (!destination) {
                return;
            }
            if (destination.droppableId === source.droppableId && destination.index === source.index) {
                return;
            }
            let { fromPan, coords } = this.formatMove(source.droppableId, destination.droppableId);
            let pMove = this.checkMove(this.chess.fen());
            if (pMove) {
                if (this.checkPromo(fromPan)) {
                    if (this.state.promotionTo !== null) {
                        this.chess.move({
                            from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`,
                            to: `${xAxis[coords[0]]}${yAxis[coords[1]]}`,
                        });
                        this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] });
                    }
                } else {
                    this.chess.move({ from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, to: `${xAxis[coords[0]]}${yAxis[coords[1]]}` });
                    this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] });
                }
                if (this.state.currentFen === this.chess.fen()) {
                } else {
                    let currentmove = this.chess.fen();
                    let matchRoom = this.state.matchRoom;
                    if (this.state.currentFen !== this.chess.fen()) {
                        this.setState({ movesMade: this.state.movesMade + 1 });
                        socket.emit('sendMove', { currentmove, matchRoom });
                    }
                    this.setState({ currentFen: this.chess.fen() });
                }
            }
            this.gameOver(this.chess);
            this.check(this.chess);
        };

        const handleMove = (e) => {
            let target;
            if (typeof e === 'string') {
                target = e;
            } else {
                target = e.target.parentNode.id;
            }
            this.setState({ targetPanel: target });
            if (this.state.targetPeice !== null) {
                let { fromPan, coords } = this.formatMove(this.state.peicePanel, target);
                let pMove = this.checkMove(this.chess.fen());
                if (pMove) {
                    if (this.checkPromo(fromPan)) {
                        this.chess.move({ from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, to: `${xAxis[coords[0]]}${yAxis[coords[1]]}` });
                        this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] });
                    } else {
                        this.chess.move({ from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, to: `${xAxis[coords[0]]}${yAxis[coords[1]]}` });
                        this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] });
                    }
                    if (this.state.currentFen === this.chess.fen()) {
                    } else {
                        let currentmove = this.chess.fen();
                        let matchRoom = this.state.matchRoom;
                        if (this.state.currentFen !== this.chess.fen()) {
                            this.setState({ movesMade: this.state.movesMade + 1 });
                            socket.emit('sendMove', { currentmove, matchRoom });
                        }
                        this.setState({ currentFen: this.chess.fen() });
                    }
                }
                this.highlightPanels(target);
                this.setState({ targetPeice: null });
                this.setState({ peicePanel: null });
            }
            this.gameOver(this.chess);
            this.check(this.chess);
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
                        <Chessboard getPeice={getPeice} player={this.state.player} onMove={handleMove} handleDrag={handleDrag} currentFen={this.state.currentFen} />
                        <ul className="playerDetails">
                            <li>
                                <img src={this.props.user.credentials.imageUrl} alt="icon" className="gameIcon" />
                            </li>
                            <li>
                                <a className="gameHandle"> {this.props.user.credentials.handle}</a>
                            </li>
                        </ul>
                    </div>
                    {this.state.promo && (
                        <div className="promotion">
                            <button
                                className="btn"
                                onClick={() => {
                                    this.choosePromo('q');
                                }}
                            >
                                Queen
                            </button>
                            <button
                                className="btn"
                                onClick={() => {
                                    this.choosePromo('r');
                                }}
                            >
                                Rook
                            </button>
                            <button
                                className="btn"
                                onClick={() => {
                                    this.choosePromo('b');
                                }}
                            >
                                Bishop
                            </button>
                            <button
                                className="btn"
                                onClick={() => {
                                    this.choosePromo('n');
                                }}
                            >
                                Knight
                            </button>
                        </div>
                    )}
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
                    {this.state.inCheck && <h1 className="alert">Check</h1>}
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
                    <h3 className="popGames">Chess</h3>
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

Chessgame.propTypes = {
    user: PropTypes.object.isRequired,
    statistics: PropTypes.object.isRequired,
    opponent: PropTypes.object.isRequired,
    setOpponent: PropTypes.func.isRequired,
    setUserStats: PropTypes.func.isRequired,
    getUserStats: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { setOpponent, setUserStats, getUserStats })(Chessgame);
