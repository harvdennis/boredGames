import React, { Component } from 'react'; //react and the components are imported from react
import Chessboard from './chessboard'; //chessboard is imported
import './chessboard.css'; //chessboard styles are imported
import { Link } from 'react-router-dom'; //Link is imported from react router
import { setOpponent } from '../../redux/actions/opponentActions'; //the redux funtion setOpponent is imported from the opponent actions
import { setUserStats, getUserStats } from '../../redux/actions/userActions'; // the redux funtions setUserStats and getUserStats are imported from the user actions

import io from 'socket.io-client'; //the socket io client is imported
import PropTypes from 'prop-types'; //PropTypes are imported
import { connect } from 'react-redux'; // connect is imported to allow the page to speak to redux

const Chess = require('chess.js'); //The chess library is imported

let socket; //delare the socket variable

class Chessgame extends Component {
    constructor() {
        super();
        this.chess = null;
        this.checkingMove = null;

        this.state = {
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
        //This funtion is used whenever an input is used
        this.setState({
            //the funtion is called after every keystroke whe the user is typing into the input
            [e.target.name]: e.target.value, // this line updates the contents of the input
        });
    };

    customGame = (e) => {
        e.preventDefault(); //prevents default event, in this case reloading the page
        let room = this.state.code; //gets the room code inputed by the user
        if (this.state.joinedRoom) {
            const user = this.state.user;
            socket.emit('waiting', { user, room }); //emits the waiting command to the server with the users data and the room code
        }
    };

    componentDidUpdate(prevProps) {
        //listens to see if the component has been updated
        if (this.props.user.credentials.handle !== prevProps.user.credentials.handle) {
            //checks to see if the props have been updated
            socket.emit('disconnected'); //makes sure the user is initially disconnected, they dont want to be connected twice
            const user = this.props.user.credentials.handle;
            const room = 'chess';
            console.log(`${user} joining ${room}`);
            socket.emit('joinRoom', { user, room }); //emits the joinRoom command, this is to show the user as an online player in the game room
            this.setState({ user: this.props.user.credentials.handle }); // the user state varible is updated
        }
    }

    componentDidMount() {
        //check to see if the component has loaded
        //socket = io('http://192.168.1.106:5000' || 'http://localhost:5000'); //use when developing

        socket = io(); //use when deploying to heroku

        if (this.props.user.credentials.handle) {
            //checks to see if the props have been loaded
            socket.emit('disconnected'); //makes sure the user is initially disconnected, they dont want to be connected twice
            const user = this.props.user.credentials.handle;
            const room = 'chess';
            console.log(`${user} joining ${room}`);
            socket.emit('joinRoom', { user, room }); //emits the joinRoom command, this is to show the user as an online player in the game room
            this.setState({ user: this.props.user.credentials.handle }); // the user state varible is updated
        }

        socket.on('joinedRoom', (data) => {
            //listens for the joinedRoom command from the server
            this.setState({ joinedRoom: data }); //updates the joinedRoom state variable, indicates that the joining was successful
            console.log(`joined ${data}`);
        });

        socket.on('loading', (data) => {
            //listens for the loading command from the server
            this.setState({ loading: data }); //updates the loading state variable accordingly
        });

        socket.on('joinedMatch', (room) => {
            this.chess = new Chess(); //initialises the chess game
            this.checkingMove = new Chess(); //initialises another chess game which is used for checking valid moves
            let time = new Date(); // gets the current time from when the match is joined
            this.setState({ startTime: time }); //updates the start time state variable
            this.setState({ currentFen: this.chess.fen() }); //sets the current FEN of the board as a state variable
            this.setState({ joinedMatch: true }); //updates the joinedMatch state varibale to true
            this.setState({ matchRoom: room }); //The match room state variable is set
            this.props.getUserStats(); //the redux function getUserStats is called
            console.log(`joined match ${room}`);
        });

        socket.on('player', (player) => {
            //listens for the player command from the server
            this.setState({ player: player.colour }); //the player colour state variable is set
            this.gameOpponent(player.opp); //the gameOpponent funtion is called
            if (player.colour === 'white') {
                this.setState({ myMove: true }); //if the player colour is white myMove is set to true
            } else {
                this.setState({ myMove: false }); //if the player colour is not white myMove is set to false
            }
        });

        socket.on('sendMove', (move) => {
            //listens for the sendMove command from the server
            this.onlineMove(move); //calls the online move function
            this.gameOver(this.chess); //checks if the game is over
            this.check(this.chess); //checks if a user is in check
        });

        socket.on('numOnline', (num) => {
            //listens for the numOnline command from the server
            this.setState({ onlinePlayers: num }); //updates the onlinePlayers state variable
        });
    }

    componentWillUnmount() {
        //listens to see if the componet is terminated
        socket.emit('disconnected'); //the disconnected command is sent to the server
    }

    gameOpponent(user) {
        this.props.setOpponent(user); //the redux function setOpponent is called to updated the opponent redux object
    }

    onlineMove(move) {
        this.chess.load(move); //loads the current move to the board
        this.setState({ myMove: true }); //sets the state variable myMove to true
        this.setState({ currentFen: move }); //sets the current fen of the board to the state variable
        //console.log('moved');
    }

    formatMove(fromPan, coords) {
        //called to format the move
        fromPan = fromPan.split('-'); //splits the string by the "-" characters
        fromPan[0] = parseInt(fromPan[0]); //casts the string values of the array items into integer values
        fromPan[1] = parseInt(fromPan[1]); //casts the string values of the array items into integer values
        coords = coords.split('-'); //splits the string by the "-" characters
        coords[0] = parseInt(coords[0]); //casts the string values of the array items into integer values
        coords[1] = parseInt(coords[1]); //casts the string values of the array items into integer values

        return { fromPan, coords }; //returns the cast values
    }

    checkMove(fen) {
        let fenArr = fen.split(' '); //splits the string by " " character
        if (this.state.player === 'black') {
            //checks if the player is black
            if (fenArr[1] === 'w') {
                return false;
            } else {
                return true; //if the fen indicates blacks move return true
            }
        } else {
            // checks if the player is white
            if (fenArr[1] === 'b') {
                return false;
            } else {
                return true; //if the fen indicated whites move return true
            }
        }
    }

    highlightPanels(peicePanel) {
        const xAxis = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const yAxis = ['8', '7', '6', '5', '4', '3', '2', '1'];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.checkingMove.load(this.state.currentFen); //the current move is loaded into to checking move chess state
                let { fromPan, coords } = this.formatMove(peicePanel, `${i}-${j}`); //format the move
                let shouldHightlight = this.checkingMove.move({
                    from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`,
                    to: `${xAxis[coords[0]]}${yAxis[coords[1]]}`,
                }); //makes a virtual move in the checking move state
                if (shouldHightlight) {
                    let panel = document.getElementById(`${i}-${j}`).firstElementChild;
                    panel.classList.add('highlighted'); //if move is valid highlight the move square
                } else {
                    let panel = document.getElementById(`${i}-${j}`).firstElementChild;
                    panel.classList.remove('highlighted'); //if move isn't valid un-highlight the move square
                }
            }
        }
    }

    updateStats(win) {
        let finalTime = new Date(); //get the end time of the match
        let elapsed = (finalTime.getTime() - this.state.startTime.getTime()) / 1000; //calculates the elapsed time of the match
        let placeholder = this.props.stats; //gets the users stats and puts them into a placeholder variable
        placeholder.chess.gamesPlayed = placeholder.chess.gamesPlayed + 1; //gamesPlayed incremented by one
        placeholder.chess.hoursPlayed = placeholder.chess.hoursPlayed + elapsed; //elapsed time added to total time
        placeholder.chess.movesMade = placeholder.chess.movesMade + this.state.movesMade; //total moves made added to the total moves made
        if (win) {
            //checks if the user won
            placeholder.chess.gamesWon = placeholder.chess.gamesWon + 1; //games won is incremented
            placeholder.chess.winTimes = placeholder.chess.winTimes + elapsed; //elapsed time is added to total win time
            placeholder.chess.winMoves = placeholder.chess.winMoves + this.state.movesMade; // moves made is added to total winning moves
            placeholder.recent.winLoss = 'Win';
        } else {
            //checks if the user has lost
            placeholder.recent.winLoss = 'Loss'; //recent Winloss is set to loss
        }
        placeholder.recent.game = 'Chess';
        placeholder.recent.movesMade = this.state.movesMade;
        placeholder.recent.opponent = this.props.opponent.opponent.handle;
        placeholder.recent.timePlayed = elapsed;
        //all the recent stats are updated with the corresponding data

        this.props.setUserStats(placeholder); //the redux fucntion setUserStats is called with the placeholder as a argument
    }

    gameOver(chess) {
        if (chess.in_checkmate()) {
            //checks if the board is in checkmate
            let loser = chess.fen().split(' ')[1]; //gets the colour of the loser
            if (loser === 'w') {
                if (this.state.player === 'white') {
                    //if the loser is white and the players colour is white the game is ended and stats updated
                    this.setState({ lost: true }); //user loses
                    this.updateStats(false);
                } else {
                    //if the loser is white and the players colour is black the game is ended and stats updated
                    this.setState({ won: true }); //user wins
                    this.updateStats(true);
                }
            } else if (loser === 'b') {
                if (this.state.player === 'black') {
                    //if the loser is black and the players colour is black the game is ended and stats updated
                    this.setState({ lost: true }); //user loses
                    this.updateStats(false);
                } else {
                    //if the loser is black and the players colour is white the game is ended and stats updated
                    this.setState({ won: true }); //user wins
                    this.updateStats(true);
                }
            }
        } else if (chess.in_draw()) {
            //checks if there is a draw
            this.setState({ draw: true }); //draw is set to true
            this.updateStats(false);
        } else if (chess.in_stalemate()) {
            //checks if there is a stalemate
            this.setState({ draw: true }); //draw is set to true
            this.updateStats(false);
        }
    }

    check(chess) {
        if (chess.in_check()) {
            //checks if the board is in check
            this.setState({ inCheck: true }); //inCheck is set to true
            setTimeout(() => {
                //the console waits for 2.5 seconds then sets inCheck to false
                this.setState({ inCheck: false });
            }, 2500);
        }
    }

    choosePromo(peice) {
        this.chess.move({
            from: this.state.prevMove[0],
            to: this.state.prevMove[1],
            promotion: peice, //the pawn is promoted to the parameter passed by the user
        });
        this.setState({ promo: false }); //promotion is set to false
        let currentmove = this.chess.fen(); //the new board is saved
        let matchRoom = this.state.matchRoom;
        socket.emit('sendMove', { currentmove, matchRoom }); //the new board is sent to the opponent so their board can update
        this.setState({ currentFen: this.chess.fen() }); //current fem is updated
    }

    checkPromo(fromPan, coords) {
        const xAxis = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const yAxis = ['8', '7', '6', '5', '4', '3', '2', '1'];
        let isPawn = this.chess.get(`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`); //gets the peice from the the fromPan parameter
        if (fromPan[1] === 1 && coords[1] === 0 && isPawn.type === 'p' && isPawn.color === 'w') {
            //checks if the the peice is a pawn and if white in a valid postition
            this.setState({ promo: true }); //promo is set to true
            return true;
        } else if (fromPan[1] === 6 && coords[1] === 7 && isPawn.type === 'p' && isPawn.color === 'b') {
            //checks if the the peice is a pawn and if black in a valid postition
            this.setState({ promo: true });
            return true;
        } else {
            return false; //if its not a pawn or not in a valid position false is returned
        }
    }

    render() {
        const xAxis = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const yAxis = ['8', '7', '6', '5', '4', '3', '2', '1'];
        const newGame = () => {
            if (this.state.joinedRoom) {
                //check to see if a user has joined a game room
                const user = this.state.user;
                const room = 'chess';
                socket.emit('waiting', { user, room }); //emits the waiting command to the server
            }
        };

        const stopSearch = () => {
            if (this.state.joinedRoom) {
                //check to see if a user has joined a game room
                const user = this.state.user;
                const room = 'chess';
                socket.emit('stopSearch', { user, room }); //emits the stop search command to the server
            }
        };

        const makeRoom = () => {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; //list of the available character that the function can use
            var charactersLength = characters.length; //set the length of the list as a variable
            for (var i = 0; i < 6; i++) {
                //loops through 6 times
                result += characters.charAt(Math.floor(Math.random() * charactersLength)); //appends a random character from the list to the result
            }
            this.setState({ customRoom: result }); //the custion room state variable is updated with result from the function
        };

        const getPeice = (e) => {
            let targetPeice;
            let peicePanel;
            const xAxis = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const yAxis = ['8', '7', '6', '5', '4', '3', '2', '1'];

            targetPeice = e.target.id; //gets the peice
            peicePanel = e.target.parentNode.parentNode.parentNode.id; //gets the panel that the peice is in
            targetPeice = parseInt(targetPeice); //converts the target peice into an integer
            this.highlightPanels(peicePanel); //highlights the avaiblable panels the peice can move to
            if (this.state.targetPeice !== null) {
                //checks if the peice exists
                let { fromPan, coords } = this.formatMove(this.state.peicePanel, peicePanel); //move is formatted
                if (this.checkPromo(fromPan, coords)) {
                    //checks for pawn promotion
                    if (this.state.promotionTo !== null) {
                        this.chess.move({
                            from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`,
                            to: `${xAxis[coords[0]]}${yAxis[coords[1]]}`,
                        }); //makes the move
                        this.highlightPanels(peicePanel);
                        this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] }); //stores the move
                    }
                } else {
                    this.chess.move({ from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, to: `${xAxis[coords[0]]}${yAxis[coords[1]]}` }); //makes the move
                    this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] }); //stores the move
                }

                let currentmove = this.chess.fen();
                let matchRoom = this.state.matchRoom;
                if (this.state.currentFen !== this.chess.fen()) {
                    //if the board has changed the new board is sent to the opponent for their board to update
                    this.setState({ movesMade: this.state.movesMade + 1 }); //moves made is incremented
                    this.setState({ myMove: false }); //mymove set to false
                    socket.emit('sendMove', { currentmove, matchRoom }); //move is sent to opponent
                }
                this.setState({ currentFen: this.chess.fen() }); //current fen updated
                this.setState({ targetPeice });
                this.setState({ peicePanel });
            } else {
                this.setState({ targetPeice });
                this.setState({ peicePanel });
            }
            this.gameOver(this.chess); //check if the game is over
            this.check(this.chess); //check if there is a check
        };

        const handleDrag = (e) => {
            const { destination, source, draggableId } = e;
            if (!destination) {
                //if there isn't any destination do nothing
                return;
            }
            if (destination.droppableId === source.droppableId && destination.index === source.index) {
                //if the peice is dropped in the same place do nothing
                return;
            }
            let { fromPan, coords } = this.formatMove(source.droppableId, destination.droppableId); //move is formatted
            let pMove = this.checkMove(this.chess.fen()); //check if the move is valid
            if (pMove) {
                //if move is valid
                if (this.checkPromo(fromPan, coords)) {
                    //check if promtion is available
                    if (this.state.promotionTo !== null) {
                        this.chess.move({
                            from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`,
                            to: `${xAxis[coords[0]]}${yAxis[coords[1]]}`,
                        }); //make move
                        this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] }); //the move is stored
                    }
                } else {
                    this.chess.move({ from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, to: `${xAxis[coords[0]]}${yAxis[coords[1]]}` }); //make move
                    this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] }); //the move is stored
                }
                if (this.state.currentFen === this.chess.fen()) {
                } else {
                    //if the board has changed the new board is sent to the opponent for their board to update
                    let currentmove = this.chess.fen();
                    let matchRoom = this.state.matchRoom;
                    if (this.state.currentFen !== this.chess.fen()) {
                        this.setState({ movesMade: this.state.movesMade + 1 }); //moves made is incremented by one
                        this.setState({ myMove: false }); //mymove is set to false
                        socket.emit('sendMove', { currentmove, matchRoom }); //move is sent to opponent
                    }
                    this.setState({ currentFen: this.chess.fen() }); //current fen is updated
                }
            }
            this.gameOver(this.chess); //check if the game is over
            this.check(this.chess); //check if there is a check
        };

        const handleMove = (e) => {
            let target;
            if (typeof e === 'string') {
                target = e; //checks if the target is a chess peice
            } else {
                target = e.target.parentNode.id; //checks if the target is a panel
            }
            this.setState({ targetPanel: target });
            if (this.state.targetPeice !== null) {
                //checks if the peice is valid
                let { fromPan, coords } = this.formatMove(this.state.peicePanel, target); //formats the move
                let pMove = this.checkMove(this.chess.fen()); //checks the move is valid
                if (pMove) {
                    //if valid
                    if (this.checkPromo(fromPan, coords)) {
                        //checks for promotion
                        this.chess.move({ from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, to: `${xAxis[coords[0]]}${yAxis[coords[1]]}` }); //makes the move
                        this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] }); //stores the move
                    } else {
                        this.chess.move({ from: `${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, to: `${xAxis[coords[0]]}${yAxis[coords[1]]}` }); //makes the move
                        this.setState({ prevMove: [`${xAxis[fromPan[0]]}${yAxis[fromPan[1]]}`, `${xAxis[coords[0]]}${yAxis[coords[1]]}`] }); //stores the move
                    }
                    if (this.state.currentFen === this.chess.fen()) {
                    } else {
                        //if the board has changed the new board is sent to the opponent for their board to update
                        let currentmove = this.chess.fen();
                        let matchRoom = this.state.matchRoom;
                        if (this.state.currentFen !== this.chess.fen()) {
                            this.setState({ movesMade: this.state.movesMade + 1 }); //moves made is incremented by one
                            this.setState({ myMove: false }); //mymove is set to false
                            socket.emit('sendMove', { currentmove, matchRoom }); //move is sent to opponent
                        }
                        this.setState({ currentFen: this.chess.fen() }); //current fen is updated
                    }
                }
                this.highlightPanels(target);
                this.setState({ targetPeice: null });
                this.setState({ peicePanel: null });
            }
            this.gameOver(this.chess); //checks if the game is over
            this.check(this.chess); //checks if the board is in check
        };
        if (this.state.joinedMatch) {
            //if a match is joined
            return (
                <div>
                    <div className="boardContainer">
                        <ul className={!this.state.myMove ? 'playerDetails userMove' : 'playerDetails'}>
                            {/*if it is the players move their name is higlighted*/}
                            <li>
                                <img src={this.props.opponent.opponent.imageUrl} alt="icon" className="gameIcon" />
                            </li>
                            <li>
                                <a className="gameHandle"> {this.props.opponent.opponent.handle}</a>
                            </li>
                            {!this.state.myMove && <h4>Opponents move</h4>}
                        </ul>
                        <Chessboard getPeice={getPeice} player={this.state.player} onMove={handleMove} handleDrag={handleDrag} currentFen={this.state.currentFen} />
                        {/*The chessboard is displayed with the functions passed into it through props*/}
                        <ul className={this.state.myMove ? 'playerDetails userMove' : 'playerDetails'}>
                            {/*if it is the players move their name is higlighted*/}
                            <li>
                                <img src={this.props.user.credentials.imageUrl} alt="icon" className="gameIcon" />
                            </li>
                            <li>
                                <a className="gameHandle"> {this.props.user.credentials.handle}</a>
                            </li>
                            {this.state.myMove && <h4>Your move</h4>}
                        </ul>
                    </div>
                    {this.state.promo && ( //if promotion is available display the promotion selection table
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
                    {this.state.won && ( //if the user has won display the end screen
                        <div className="endScreen">
                            <h3>You Won</h3>
                            <Link to="/games" className="btn">
                                Back to games
                            </Link>
                        </div>
                    )}
                    {this.state.draw && ( //if the user has drawn display the end screen
                        <div className="endScreen">
                            <h3>Draw</h3>
                            <Link to="/games" className="btn">
                                Back to games
                            </Link>
                        </div>
                    )}
                    {this.state.lost && ( //if the user has lost display the end screen
                        <div className="endScreen">
                            <h3>You Lost</h3>
                            <Link to="/games" className="btn">
                                Back to games
                            </Link>
                        </div>
                    )}
                    {this.state.inCheck && <h1 className="alert">Check</h1>}
                    {/*when the state variable inCheck is true display the text check*/}
                </div>
            );
        } else {
            //if user is not in a match the lobby is displayed
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
                            {/*when clicked a the user searches for a new game*/}
                        </div>
                    )}
                    {this.state.user && this.state.loading && (
                        <button className="btn" onClick={stopSearch}>
                            {/*when clicked a the user stops searching for a new game*/}
                            Cancel search
                        </button>
                    )}
                    {this.state.loading && <h3 className="load">Loading...</h3>}
                    {/*checks if loading is true if so loading is displayed*/}
                    <h4 style={{ marginBottom: '1rem', color: 'white' }}>Players online: {this.state.onlinePlayers}</h4>
                    {/*displays the amount of player online*/}
                    <div>
                        <h3 className="popGames">Custom Match</h3>
                        <button className="btn" onClick={makeRoom}>
                            {/*when clicked it generates a custom code*/}
                            Generate Code
                        </button>
                        {this.state.customRoom && <h3>{this.state.customRoom}</h3>}
                        <div className="inputCode">
                            <form noValidate onSubmit={this.customGame}>
                                <input value={this.state.users} id="code" type="text" name="code" placeholder="input code" onChange={this.handleChange} />
                                {/*input used to input custom codes*/}
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
    //maps the redux state to the components props
    user: state.user,
    opponent: state.opponent,
    stats: state.statistics.stats,
});

Chessgame.propTypes = {
    //defines the types of each prop so no unwanted errors occur
    user: PropTypes.object.isRequired,
    statistics: PropTypes.object.isRequired,
    opponent: PropTypes.object.isRequired,
    setOpponent: PropTypes.func.isRequired,
    setUserStats: PropTypes.func.isRequired,
    getUserStats: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { setOpponent, setUserStats, getUserStats })(Chessgame); //connect links react and redux together so they can be used together
