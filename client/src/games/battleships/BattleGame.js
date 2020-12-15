import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { setOpponent } from '../../redux/actions/opponentActions';
import { setUserStats, getUserStats } from '../../redux/actions/userActions';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './battleships.css';
import Ship from './Ship';
import Panel from './Panel';
import { DragDropContext } from 'react-beautiful-dnd';

let socket;

export class BattleGame extends Component {
    constructor() {
        super();
        this.state = {
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
            userHits: 0,
            oppHits: 0,
            destroyerRotate: false,
            submarineRotate: false,
            cruiserRotate: false,
            battleshipRotate: false,
            carrierRotate: false,
            destroyerPos: null,
            submarinePos: null,
            cruiserPos: null,
            battleshipPos: null,
            carrierPos: null,
            boardValid: false,
            boardReady: false,
            board: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
            placeholderBoard: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
            placeholderOppBoard: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ],
            opBoard: null,
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
            let time = new Date();
            this.setState({ startTime: time });
            this.setState({ joinedRoom: data });
            console.log(`joined ${data}`);
        });

        socket.on('loading', (data) => {
            this.setState({ loading: data });
        });

        socket.on('joinedMatch', (room) => {
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
            console.log(move);
            this.onlineMove(move);
            this.gameOver();
        });

        socket.on('setOppBoard', (board) => {
            this.setState({ opBoard: board });
        });

        socket.on('numOnline', (num) => {
            this.setState({ onlinePlayers: num });
        });
    }

    componentWillUnmount() {
        socket.emit('disconnected');
    }

    gameOpponent(user) {
        this.props.setOpponent(user);
    }

    onlineMove(move) {
        let placeholder = this.state.placeholderBoard;
        let board = this.state.board;
        console.log(board);
        let pos = move;
        if (board[pos[1]][pos[2]] === 1) {
            placeholder[pos[1]][pos[2]] = 1;
            this.setState({ oppHits: this.state.oppHits + 1 });
        } else {
            placeholder[pos[1]][pos[2]] = 2;
        }
        this.setState({ placeholderBoard: placeholder });
        this.setState({ myMove: true });
        this.gameOver();
    }

    changeboard() {
        let count = 0;
        let filled = 0;
        let board = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
        if (this.state.destroyerPos !== null) {
            count = count + 2;
            board[this.state.destroyerPos.x][this.state.destroyerPos.y] = 1;
            if (this.state.destroyerRotate) {
                if (this.state.destroyerPos.y + 1 < 10) {
                    board[this.state.destroyerPos.x][this.state.destroyerPos.y + 1] = 1;
                }
            } else {
                if (this.state.destroyerPos.x + 1 < 10) {
                    board[this.state.destroyerPos.x + 1][this.state.destroyerPos.y] = 1;
                }
            }
        }
        if (this.state.submarinePos !== null) {
            count = count + 3;
            board[this.state.submarinePos.x][this.state.submarinePos.y] = 1;
            if (this.state.submarineRotate) {
                if (this.state.submarinePos.y + 2 < 10) {
                    board[this.state.submarinePos.x][this.state.submarinePos.y + 1] = 1;
                    board[this.state.submarinePos.x][this.state.submarinePos.y + 2] = 1;
                }
            } else {
                if (this.state.submarinePos.x + 2 < 10) {
                    board[this.state.submarinePos.x + 1][this.state.submarinePos.y] = 1;
                    board[this.state.submarinePos.x + 2][this.state.submarinePos.y] = 1;
                }
            }
        }
        if (this.state.cruiserPos !== null) {
            count = count + 3;
            board[this.state.cruiserPos.x][this.state.cruiserPos.y] = 1;
            if (this.state.cruiserRotate) {
                if (this.state.cruiserPos.y + 2 < 10) {
                    board[this.state.cruiserPos.x][this.state.cruiserPos.y + 1] = 1;
                    board[this.state.cruiserPos.x][this.state.cruiserPos.y + 2] = 1;
                }
            } else {
                if (this.state.cruiserPos.x + 2 < 10) {
                    board[this.state.cruiserPos.x + 1][this.state.cruiserPos.y] = 1;
                    board[this.state.cruiserPos.x + 2][this.state.cruiserPos.y] = 1;
                }
            }
        }
        if (this.state.battleshipPos !== null) {
            count = count + 4;
            board[this.state.battleshipPos.x][this.state.battleshipPos.y] = 1;
            if (this.state.battleshipRotate) {
                if (this.state.battleshipPos.y + 3 < 10) {
                    board[this.state.battleshipPos.x][this.state.battleshipPos.y + 1] = 1;
                    board[this.state.battleshipPos.x][this.state.battleshipPos.y + 2] = 1;
                    board[this.state.battleshipPos.x][this.state.battleshipPos.y + 3] = 1;
                }
            } else {
                if (this.state.battleshipPos.x + 3 < 10) {
                    board[this.state.battleshipPos.x + 1][this.state.battleshipPos.y] = 1;
                    board[this.state.battleshipPos.x + 2][this.state.battleshipPos.y] = 1;
                    board[this.state.battleshipPos.x + 3][this.state.battleshipPos.y] = 1;
                }
            }
        }
        if (this.state.carrierPos !== null) {
            count = count + 5;
            board[this.state.carrierPos.x][this.state.carrierPos.y] = 1;
            if (this.state.carrierRotate) {
                if (this.state.carrierPos.y + 4 < 10) {
                    board[this.state.carrierPos.x][this.state.carrierPos.y + 1] = 1;
                    board[this.state.carrierPos.x][this.state.carrierPos.y + 2] = 1;
                    board[this.state.carrierPos.x][this.state.carrierPos.y + 3] = 1;
                    board[this.state.carrierPos.x][this.state.carrierPos.y + 4] = 1;
                }
            } else {
                if (this.state.carrierPos.x + 4 < 10) {
                    board[this.state.carrierPos.x + 1][this.state.carrierPos.y] = 1;
                    board[this.state.carrierPos.x + 2][this.state.carrierPos.y] = 1;
                    board[this.state.carrierPos.x + 3][this.state.carrierPos.y] = 1;
                    board[this.state.carrierPos.x + 4][this.state.carrierPos.y] = 1;
                }
            }
        }
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (board[i][j] === 1) {
                    filled++;
                }
            }
        }

        if (filled === count) {
            this.setState({ boardValid: false });
            this.setState({ board });
        } else {
            this.setState({ boardValid: true });
        }

        if (filled === 17) {
            this.setState({ boardReady: true });
        }
    }

    updateStats(win) {
        let finalTime = new Date();
        let elapsed = (finalTime.getTime() - this.state.startTime.getTime()) / 1000;
        let placeholder = this.props.stats;
        placeholder.battleships.gamesPlayed = placeholder.battleships.gamesPlayed + 1;
        placeholder.battleships.hoursPlayed = placeholder.battleships.hoursPlayed + elapsed;
        placeholder.battleships.movesMade = placeholder.battleships.movesMade + this.state.movesMade;
        if (win) {
            placeholder.battleships.gamesWon = placeholder.battleships.gamesWon + 1;
            placeholder.battleships.winTimes = placeholder.battleships.winTimes + elapsed;
            placeholder.battleships.winMoves = placeholder.battleships.winMoves + this.state.movesMade;
            placeholder.recent.winLoss = 'Win';
        } else {
            placeholder.recent.winLoss = 'Loss';
        }
        placeholder.recent.game = 'Battleships';
        placeholder.recent.movesMade = this.state.movesMade;
        placeholder.recent.opponent = this.props.opponent.opponent.handle;
        placeholder.recent.timePlayed = elapsed;

        this.props.setUserStats(placeholder);
    }

    gameOver() {
        if (this.state.userHits >= 17) {
            this.setState({ won: true });
            this.setState({ myMove: false });
            this.updateStats(true);
        }
        if (this.state.oppHits >= 17) {
            this.setState({ lost: true });
            this.setState({ myMove: false });
            this.updateStats(false);
        }
    }

    checkRotate(name) {
        const callChange = () => {
            this.changeboard();
        };
        if (name === 'Destroyer') {
            this.setState({ destroyerRotate: !this.state.destroyerRotate }, callChange);
        } else if (name === 'Submarine') {
            this.setState({ submarineRotate: !this.state.submarineRotate }, callChange);
        } else if (name === 'Cruiser') {
            this.setState({ cruiserRotate: !this.state.cruiserRotate }, callChange);
        } else if (name === 'Battleship') {
            this.setState({ battleshipRotate: !this.state.battleshipRotate }, callChange);
        } else if (name === 'Carrier') {
            this.setState({ carrierRotate: !this.state.carrierRotate }, callChange);
        }
    }

    checkPos(name, Pos) {
        const callChange = () => {
            this.changeboard();
        };
        let pos = Pos.split('-');
        if (name === 'Destroyer') {
            if (pos.length < 2) {
                this.setState({ destroyerPos: null }, callChange);
            } else {
                this.setState({ destroyerPos: { x: parseInt(pos[0]), y: parseInt(pos[1]) } }, callChange);
            }
        } else if (name === 'Submarine') {
            if (pos.length < 2) {
                this.setState({ submarinePos: null }, callChange);
            } else {
                this.setState({ submarinePos: { x: parseInt(pos[0]), y: parseInt(pos[1]) } }, callChange);
            }
        } else if (name === 'Cruiser') {
            if (pos.length < 2) {
                this.setState({ cruiserPos: null }, callChange);
            } else {
                this.setState({ cruiserPos: { x: parseInt(pos[0]), y: parseInt(pos[1]) } }, callChange);
            }
        } else if (name === 'Battleship') {
            if (pos.length < 2) {
                this.setState({ battleshipPos: null }, callChange);
            } else {
                this.setState({ battleshipPos: { x: parseInt(pos[0]), y: parseInt(pos[1]) } }, callChange);
            }
        } else if (name === 'Carrier') {
            if (pos.length < 2) {
                this.setState({ carrierPos: null }, callChange);
            } else {
                this.setState({ carrierPos: { x: parseInt(pos[0]), y: parseInt(pos[1]) } }, callChange);
            }
        }
    }

    render() {
        const handleDrag = (e) => {
            const { destination, source, draggableId } = e;
            if (!destination) {
                return;
            }

            //let origin = document.getElementById(source.droppableId);
            let panel = document.getElementById(destination.droppableId);
            let ship = document.getElementById(draggableId);
            //console.log(destination.droppableId, draggableId);

            this.checkPos(draggableId, destination.droppableId);

            panel.appendChild(ship);
        };

        const handleMove = (e) => {
            let placeholder = this.state.placeholderOppBoard;
            let matchRoom = this.state.matchRoom;
            let targetPanel = e.target.id;
            let currentmove = targetPanel.split('-');
            if (this.state.myMove) {
                if (placeholder[currentmove[1]][currentmove[2]] === 0) {
                    if (this.state.opBoard[currentmove[1]][currentmove[2]] === 1) {
                        placeholder[currentmove[1]][currentmove[2]] = 1;
                        this.setState({ userHits: this.state.userHits + 1 });
                    } else {
                        placeholder[currentmove[1]][currentmove[2]] = 2;
                    }
                    socket.emit('sendMove', { currentmove, matchRoom });
                    this.setState({ movesMade: this.state.movesMade + 1 });
                    this.setState({ placeholderOppBoard: placeholder });
                    if (this.state.userHits + 1 >= 17) {
                        this.setState({ won: true });
                    }
                    this.setState({ myMove: false });
                }
            }
        };

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

        const deploy = () => {
            let board = this.state.board;
            let matchRoom = this.state.matchRoom;

            let ships = document.getElementById('ships');
            let destroyer = document.getElementById('Destroyer');
            let submarine = document.getElementById('Submarine');
            let cruiser = document.getElementById('Cruiser');
            let battleship = document.getElementById('Battleship');
            let carrier = document.getElementById('Carrier');
            destroyer.remove();
            submarine.remove();
            cruiser.remove();
            battleship.remove();
            carrier.remove();
            ships.remove();

            socket.emit('battleBoard', { board, matchRoom });
            this.setState({ boardReady: false });
        };

        let panels = [];
        let panelsOpp = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.state.placeholderBoard[j][i] === 0) {
                    panels.push(<Panel key={j + i * 10} location={`${j}-${i}`}></Panel>);
                }
                if (this.state.placeholderBoard[j][i] === 1) {
                    panels.push(<Panel key={j + i * 10} location={`${j}-${i}`} color={'orangered'}></Panel>);
                }
                if (this.state.placeholderBoard[j][i] === 2) {
                    panels.push(<Panel key={j + i * 10} location={`${j}-${i}`} color={'#333'}></Panel>);
                }
            }
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.state.placeholderOppBoard[j][i] === 0) {
                    panelsOpp.push(<div key={j + i * 10} id={`-${j}-${i}`} className="shipPanel" onClick={handleMove}></div>);
                }
                if (this.state.placeholderOppBoard[j][i] === 1) {
                    panelsOpp.push(<div key={j + i * 10} id={`-${j}-${i}`} className="shipPanel" onClick={handleMove} style={{ backgroundColor: 'orangered' }}></div>);
                }
                if (this.state.placeholderOppBoard[j][i] === 2) {
                    panelsOpp.push(<div key={j + i * 10} id={`-${j}-${i}`} className="shipPanel" onClick={handleMove} style={{ backgroundColor: '#333' }}></div>);
                }
            }
        }
        if (this.state.joinedMatch) {
            return (
                <div style={{ width: '100%', height: '100vh' }}>
                    <DragDropContext onDragEnd={handleDrag}>
                        <div className="homeBattlefield">
                            <h3>Home fleet</h3>
                            <div className="ships" id="ships">
                                <Panel location={'dockDestroyer'}>
                                    <Ship id="Destroyer" index={0} length={2} checkRotate={this.checkRotate.bind(this)} />
                                </Panel>
                                <Panel location={'dockSubmarine'}>
                                    <Ship id="Submarine" index={1} length={3} checkRotate={this.checkRotate.bind(this)} />
                                </Panel>
                                <Panel location={'dockCruiser'}>
                                    <Ship id="Cruiser" index={2} length={3} checkRotate={this.checkRotate.bind(this)} />
                                </Panel>
                                <Panel location={'dockBattleship'}>
                                    <Ship id="Battleship" index={3} length={4} checkRotate={this.checkRotate.bind(this)} />
                                </Panel>
                                <Panel location={'dockCarrier'}>
                                    <Ship id="Carrier" index={4} length={5} checkRotate={this.checkRotate.bind(this)} />
                                </Panel>
                            </div>
                            <div className={this.state.boardValid ? 'battlefield nonValid' : 'battlefield'}>{panels}</div>
                            {this.state.boardReady && (
                                <button className="deploy" onClick={deploy}>
                                    Deploy fleet
                                </button>
                            )}
                        </div>
                        <div id="oppBoard">
                            <h3>Opponent fleet</h3>
                            <div className="battlefield">
                                {!this.state.opBoard && <div style={{ width: 'inherit', height: 'inherit', backgroundColor: 'rgba(0,0,0,0.4)', color: 'white' }}>waiting</div>}

                                {this.state.opBoard && panelsOpp}
                            </div>
                        </div>
                    </DragDropContext>
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
                    <h3 className="popGames">Battleships</h3>
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
    stats: state.statistics.stats,
    opponent: state.opponent,
});

BattleGame.propTypes = {
    user: PropTypes.object.isRequired,
    statistics: PropTypes.object.isRequired,
    opponent: PropTypes.object.isRequired,
    setOpponent: PropTypes.func.isRequired,
    setUserStats: PropTypes.func.isRequired,
    getUserStats: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { setOpponent, setUserStats, getUserStats })(BattleGame);
