import React, { Component } from 'react';
import Chessboard from './chessboard';
import './chessboard.css';
import { Link } from 'react-router-dom';

import io from 'socket.io-client';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Chess = require('chess.js');

let socket;

class Chessgame extends Component {
    constructor(props) {
        super(props);
        this.chess = null;
        this.checkingMove = null;

        this.state = {
            getPeice: null,
            targetPanel: null,
            targetPeice: null,
            peicePanel: null,
            currentFen: null,
            user: null,
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
            inCheck: false,
            onlinePlayers: 0,
            roomCode: '',
        };
    }

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
        socket = io('http://192.168.1.106:5000' || 'http://localhost:5000');

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
            this.setState({ currentFen: this.chess.fen() });
            this.setState({ joinedMatch: true });
            this.setState({ matchRoom: room });
            console.log(`joined match ${room}`);
        });

        socket.on('player', (colour) => {
            this.setState({ player: colour });
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

    joinCustom = (e) => {
        e.preventDefault();
    };

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

    gameOver(chess) {
        if (chess.in_checkmate()) {
            let loser = chess.fen().split(' ')[1];
            if (loser === 'w') {
                if (this.state.player === 'white') {
                    this.setState({ lost: true });
                } else {
                    this.setState({ won: true });
                }
            } else if (loser === 'b') {
                if (this.state.player === 'black') {
                    this.setState({ lost: true });
                } else {
                    this.setState({ won: true });
                }
            }
        } else if (chess.in_draw()) {
            this.setState({ draw: true });
        } else if (chess.in_stalemate()) {
            this.setState({ draw: true });
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

        const createCustom = () => {
            if (this.state.joinedRoom) {
                const user = this.state.user;
                const room = 'chess';
                socket.emit('createCustom', { user, room });
            }
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
                    <Chessboard getPeice={getPeice} player={this.state.player} onMove={handleMove} handleDrag={handleDrag} currentFen={this.state.currentFen} />
                    {this.state.promo && (
                        <div className="promotion">
                            <button
                                className="btn"
                                onClick={() => {
                                    this.chess.move({
                                        from: this.state.prevMove[0],
                                        to: this.state.prevMove[1],
                                        promotion: 'q',
                                    });
                                    this.setState({ promo: false });
                                    let currentmove = this.chess.fen();
                                    let matchRoom = this.state.matchRoom;
                                    socket.emit('sendMove', { currentmove, matchRoom });
                                    this.setState({ currentFen: this.chess.fen() });
                                }}
                            >
                                Queen
                            </button>
                            <button
                                className="btn"
                                onClick={() => {
                                    this.chess.move({
                                        from: this.state.prevMove[0],
                                        to: this.state.prevMove[1],
                                        promotion: 'r',
                                    });
                                    this.setState({ promo: false });
                                    let currentmove = this.chess.fen();
                                    let matchRoom = this.state.matchRoom;
                                    socket.emit('sendMove', { currentmove, matchRoom });
                                    this.setState({ currentFen: this.chess.fen() });
                                }}
                            >
                                Rook
                            </button>
                            <button
                                className="btn"
                                onClick={() => {
                                    this.chess.move({
                                        from: this.state.prevMove[0],
                                        to: this.state.prevMove[1],
                                        promotion: 'b',
                                    });
                                    this.setState({ promo: false });
                                    let currentmove = this.chess.fen();
                                    let matchRoom = this.state.matchRoom;
                                    socket.emit('sendMove', { currentmove, matchRoom });
                                    this.setState({ currentFen: this.chess.fen() });
                                }}
                            >
                                Bishop
                            </button>
                            <button
                                className="btn"
                                onClick={() => {
                                    this.chess.move({
                                        from: this.state.prevMove[0],
                                        to: this.state.prevMove[1],
                                        promotion: 'n',
                                    });
                                    this.setState({ promo: false });
                                    let currentmove = this.chess.fen();
                                    let matchRoom = this.state.matchRoom;
                                    socket.emit('sendMove', { currentmove, matchRoom });
                                    this.setState({ currentFen: this.chess.fen() });
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
});

Chessgame.propTypes = {
    user: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(Chessgame);
