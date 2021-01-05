import React, { Component } from 'react'; //react and the components are imported from react
import { Link } from 'react-router-dom'; //Link is imported from react router
import { setOpponent } from '../../redux/actions/opponentActions'; //the redux funtion setOpponent is imported from the opponent actions
import { setUserStats, getUserStats } from '../../redux/actions/userActions'; // the redux funtions setUserStats and getUserStats are imported from the user actions
import io from 'socket.io-client'; //the socket io client is imported
import PropTypes from 'prop-types'; //PropTypes are imported
import { connect } from 'react-redux'; // connect is imported to allow the page to speak to redux
import './battleships.css'; //the styles for battleships is imported
import Ship from './Ship'; //the styles for an individual ship is imported
import Panel from './Panel'; // the styles for a panel is imported
import { DragDropContext } from 'react-beautiful-dnd'; // DragDropContext is imported from the react drag and drop library

let socket; //delare the socket variable

export class BattleGame extends Component {
    constructor() {
        super();
        this.state = {
            //The state is where all the local variables for the page are declared
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
            const room = 'battleships';
            //console.log(`${user} joining ${room}`);
            socket.emit('joinRoom', { user, room }); //emits the joinRoom command, this is to show the user as an online player in the game room
            this.setState({ user: this.props.user.credentials.handle }); // the user state varible is updated
        }
    }

    componentDidMount() {
        //check to see if the component has loaded
        //socket = io('http://192.168.1.106:5000' || 'http://localhost:5000'); //use when developing
        socket = io(); // use when deploying to heroku

        if (this.props.user.credentials.handle) {
            //checks to see if the props have loaded
            socket.emit('disconnected'); //makes sure the user is initially disconnected, they dont want to be connected twice
            const user = this.props.user.credentials.handle;
            const room = 'battleships';
            //console.log(`${user} joining ${room}`);
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
            // listens for the joinedMatch command from the server
            let time = new Date(); // gets the current time from when the match is joined
            this.setState({ startTime: time }); //updates the start time state variable
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
            //console.log(move);
            this.onlineMove(move); //calls the online move funtion
            this.gameOver(); //calls the gameOver funtion to check if the game has finished
        });

        socket.on('setOppBoard', (board) => {
            //listens for the setOppBoard command from the server
            this.setState({ opBoard: board }); //sets the opBoard state variable
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
        let placeholder = this.state.placeholderBoard;
        let board = this.state.board;
        //console.log(board);
        let pos = move; //sets the move to a variable
        if (board[pos[1]][pos[2]] === 1) {
            //checks to see if the opponent has hit a ship
            placeholder[pos[1]][pos[2]] = 1; //the item where the move was is updated to 1 in the 2D array to indicate a hit
            this.setState({ oppHits: this.state.oppHits + 1 }); //opponents hits are increased by one
        } else {
            placeholder[pos[1]][pos[2]] = 2; //the item where the move was is updated to 2 in the 2D array to indicate a miss
        }
        this.setState({ placeholderBoard: placeholder }); //the placeholder board state is updated
        this.setState({ myMove: true }); //the myMove state is set to true
        this.gameOver(); //the gameOver funtion is called to check if the game is ended
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
            //checks if the ship is given a position
            count = count + 2; //count is incremented by the length of the ship
            board[this.state.destroyerPos.x][this.state.destroyerPos.y] = 1; //the location of the head of the ship is set to 1
            if (this.state.destroyerRotate) {
                //checks if the ship is rotated
                if (this.state.destroyerPos.y + 1 < 10) {
                    //checks if the ship is fully on the gameboard
                    board[this.state.destroyerPos.x][this.state.destroyerPos.y + 1] = 1;
                }
            } else {
                if (this.state.destroyerPos.x + 1 < 10) {
                    //checks if the ship is fully on the gameboard
                    board[this.state.destroyerPos.x + 1][this.state.destroyerPos.y] = 1; //depending on the orientation the other locations the the ship covers are changed to 1
                }
            }
        }
        if (this.state.submarinePos !== null) {
            //checks if the ship is given a position
            count = count + 3; //count is incremented by the length of the ship
            board[this.state.submarinePos.x][this.state.submarinePos.y] = 1; //the location of the head of the ship is set to 1
            if (this.state.submarineRotate) {
                //checks if the ship is rotated
                if (this.state.submarinePos.y + 2 < 10) {
                    //checks if the ship is fully on the gameboard
                    board[this.state.submarinePos.x][this.state.submarinePos.y + 1] = 1;
                    board[this.state.submarinePos.x][this.state.submarinePos.y + 2] = 1;
                }
            } else {
                if (this.state.submarinePos.x + 2 < 10) {
                    //checks if the ship is fully on the gameboard
                    board[this.state.submarinePos.x + 1][this.state.submarinePos.y] = 1;
                    board[this.state.submarinePos.x + 2][this.state.submarinePos.y] = 1; //depending on the orientation the other locations the the ship covers are changed to 1
                }
            }
        }
        if (this.state.cruiserPos !== null) {
            //checks if the ship is given a position
            count = count + 3; //count is incremented by the length of the ship
            board[this.state.cruiserPos.x][this.state.cruiserPos.y] = 1; //the location of the head of the ship is set to 1
            if (this.state.cruiserRotate) {
                //checks if the ship is rotated
                if (this.state.cruiserPos.y + 2 < 10) {
                    //checks if the ship is fully on the gameboard
                    board[this.state.cruiserPos.x][this.state.cruiserPos.y + 1] = 1;
                    board[this.state.cruiserPos.x][this.state.cruiserPos.y + 2] = 1;
                }
            } else {
                if (this.state.cruiserPos.x + 2 < 10) {
                    //checks if the ship is fully on the gameboard
                    board[this.state.cruiserPos.x + 1][this.state.cruiserPos.y] = 1;
                    board[this.state.cruiserPos.x + 2][this.state.cruiserPos.y] = 1; //depending on the orientation the other locations the the ship covers are changed to 1
                }
            }
        }
        if (this.state.battleshipPos !== null) {
            //checks if the ship is given a position
            count = count + 4; //count is incremented by the length of the ship
            board[this.state.battleshipPos.x][this.state.battleshipPos.y] = 1; //the location of the head of the ship is set to 1
            if (this.state.battleshipRotate) {
                //checks if the ship is rotated
                if (this.state.battleshipPos.y + 3 < 10) {
                    //checks if the ship is fully on the gameboard
                    board[this.state.battleshipPos.x][this.state.battleshipPos.y + 1] = 1;
                    board[this.state.battleshipPos.x][this.state.battleshipPos.y + 2] = 1;
                    board[this.state.battleshipPos.x][this.state.battleshipPos.y + 3] = 1;
                }
            } else {
                if (this.state.battleshipPos.x + 3 < 10) {
                    //checks if the ship is fully on the gameboard
                    board[this.state.battleshipPos.x + 1][this.state.battleshipPos.y] = 1;
                    board[this.state.battleshipPos.x + 2][this.state.battleshipPos.y] = 1;
                    board[this.state.battleshipPos.x + 3][this.state.battleshipPos.y] = 1; //depending on the orientation the other locations the the ship covers are changed to 1
                }
            }
        }
        if (this.state.carrierPos !== null) {
            //checks if the ship is given a position
            count = count + 5; //count is incremented by the length of the ship
            board[this.state.carrierPos.x][this.state.carrierPos.y] = 1; //the location of the head of the ship is set to 1
            if (this.state.carrierRotate) {
                //checks if the ship is rotated
                if (this.state.carrierPos.y + 4 < 10) {
                    //checks if the ship is fully on the gameboard
                    board[this.state.carrierPos.x][this.state.carrierPos.y + 1] = 1;
                    board[this.state.carrierPos.x][this.state.carrierPos.y + 2] = 1;
                    board[this.state.carrierPos.x][this.state.carrierPos.y + 3] = 1;
                    board[this.state.carrierPos.x][this.state.carrierPos.y + 4] = 1;
                }
            } else {
                if (this.state.carrierPos.x + 4 < 10) {
                    //checks if the ship is fully on the gameboard
                    board[this.state.carrierPos.x + 1][this.state.carrierPos.y] = 1;
                    board[this.state.carrierPos.x + 2][this.state.carrierPos.y] = 1;
                    board[this.state.carrierPos.x + 3][this.state.carrierPos.y] = 1;
                    board[this.state.carrierPos.x + 4][this.state.carrierPos.y] = 1; //depending on the orientation the other locations the the ship covers are changed to 1
                }
            }
        }
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (board[i][j] === 1) {
                    filled++; //loops through all the panels an increments for every 1 value, this is used to check if ships are overlapping with each other
                }
            }
        }

        if (filled === count) {
            //if filled is equal to count there are no overlaps and the board must valid
            this.setState({ boardValid: false });
            this.setState({ board });
        } else {
            this.setState({ boardValid: true }); //if filled is not equal to count there must be overlaps and the board is not valid
        }

        if (filled === 17) {
            //if filled is equal to 17 then all the ships are put in valid places and they are ready to be deployed
            this.setState({ boardReady: true });
        }
    }

    updateStats(win) {
        let finalTime = new Date(); //get the end time of the match
        let elapsed = (finalTime.getTime() - this.state.startTime.getTime()) / 1000; //calculates the elapsed time of the match
        let placeholder = this.props.stats; //gets the users stats and puts them into a placeholder variable
        placeholder.battleships.gamesPlayed = placeholder.battleships.gamesPlayed + 1; //gamesPlayed incremented by one
        placeholder.battleships.hoursPlayed = placeholder.battleships.hoursPlayed + elapsed; //elapsed time added to total time
        placeholder.battleships.movesMade = placeholder.battleships.movesMade + this.state.movesMade; //total moves made added to the total moves made
        if (win) {
            //checks if the user won
            placeholder.battleships.gamesWon = placeholder.battleships.gamesWon + 1; //games won is incremented
            placeholder.battleships.winTimes = placeholder.battleships.winTimes + elapsed; //elapsed time is added to total win time
            placeholder.battleships.winMoves = placeholder.battleships.winMoves + this.state.movesMade; // moves made is added to total winning moves
            placeholder.recent.winLoss = 'Win'; //recent WinLoss is set to win
        } else {
            //checks if the user has lost
            placeholder.recent.winLoss = 'Loss'; //recent Winloss is set to loss
        }
        placeholder.recent.game = 'Battleships';
        placeholder.recent.movesMade = this.state.movesMade;
        placeholder.recent.opponent = this.props.opponent.opponent.handle;
        placeholder.recent.timePlayed = elapsed;
        //all the recent stats are updated with the corresponding data
        this.props.setUserStats(placeholder); //the redux fucntion setUserStats is called with the placeholder as a argument
    }

    gameOver() {
        if (this.state.userHits >= 17) {
            //checks if user hits are equal to or more than 17
            this.setState({ won: true });
            this.setState({ myMove: false });
            this.updateStats(true); //game is ended
        }
        if (this.state.oppHits >= 17) {
            //checks if opponent hits are equal to or more than 17
            this.setState({ lost: true });
            this.setState({ myMove: false });
            this.updateStats(false); //game is ended
        }
    }

    checkRotate(name) {
        const callChange = () => {
            this.changeboard(); // calls the changeboard function
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
            this.setState({ carrierRotate: !this.state.carrierRotate }, callChange); //each line checks for which ship is selected then inverts their Rotate state variable.
            //Then the changeboard funtion is called to update the board
        }
    }

    checkPos(name, Pos) {
        const callChange = () => {
            this.changeboard(); // calls the changeboard function
        };
        let pos = Pos.split('-'); //splits the string into an array for the coordinates of the position of the ship
        if (name === 'Destroyer') {
            //checks the ship moved
            if (pos.length < 2) {
                //checks to see if the posistion isn't valid
                this.setState({ destroyerPos: null }, callChange); //position set to null
            } else {
                this.setState({ destroyerPos: { x: parseInt(pos[0]), y: parseInt(pos[1]) } }, callChange); //position set to the coordinates
            }
        } else if (name === 'Submarine') {
            //checks the ship moved
            if (pos.length < 2) {
                //checks to see if the posistion isn't valid
                this.setState({ submarinePos: null }, callChange);
            } else {
                this.setState({ submarinePos: { x: parseInt(pos[0]), y: parseInt(pos[1]) } }, callChange); //position set to the coordinates
            }
        } else if (name === 'Cruiser') {
            //checks the ship moved
            if (pos.length < 2) {
                //checks to see if the posistion isn't valid
                this.setState({ cruiserPos: null }, callChange);
            } else {
                this.setState({ cruiserPos: { x: parseInt(pos[0]), y: parseInt(pos[1]) } }, callChange); //position set to the coordinates
            }
        } else if (name === 'Battleship') {
            //checks the ship moved
            if (pos.length < 2) {
                //checks to see if the posistion isn't valid
                this.setState({ battleshipPos: null }, callChange);
            } else {
                this.setState({ battleshipPos: { x: parseInt(pos[0]), y: parseInt(pos[1]) } }, callChange); //position set to the coordinates
            }
        } else if (name === 'Carrier') {
            //checks the ship moved
            if (pos.length < 2) {
                //checks to see if the posistion isn't valid
                this.setState({ carrierPos: null }, callChange);
            } else {
                this.setState({ carrierPos: { x: parseInt(pos[0]), y: parseInt(pos[1]) } }, callChange); //position set to the coordinates
            }
        }
    }

    render() {
        const handleDrag = (e) => {
            const { destination, source, draggableId } = e;
            if (!destination) {
                // if there isn't a destination do nothing
                return;
            }

            let panel = document.getElementById(destination.droppableId); // panel is set to the destination id
            let ship = document.getElementById(draggableId); //ship is set to the draggable id

            this.checkPos(draggableId, destination.droppableId); //check pos funtion is called with the draggabeId and the destination id as the arguments

            panel.appendChild(ship); //ship is appended to panel
        };

        const handleMove = (e) => {
            let placeholder = this.state.placeholderOppBoard;
            let matchRoom = this.state.matchRoom;
            let targetPanel = e.target.id;
            let currentmove = targetPanel.split('-'); //splits the move into its coordinates
            if (this.state.myMove) {
                if (placeholder[currentmove[1]][currentmove[2]] === 0) {
                    //checks if the panel has been selceted already
                    if (this.state.opBoard[currentmove[1]][currentmove[2]] === 1) {
                        //checks to see if there is part of a ship in that location
                        placeholder[currentmove[1]][currentmove[2]] = 1; //the placeholder location is set to 1 which indicates a hit
                        this.setState({ userHits: this.state.userHits + 1 }); //user hits increment by 1
                        if (this.state.userHits + 1 >= 17) {
                            //as the state doesnt update instantly we need to check for a user win
                            this.setState({ won: true });
                        }
                        this.setState({ myMove: false });
                    } else {
                        placeholder[currentmove[1]][currentmove[2]] = 2; //the placeholder location is set to 2 which indicates a miss
                    }
                    socket.emit('sendMove', { currentmove, matchRoom }); //the send move command is emitted to the server
                    this.setState({ movesMade: this.state.movesMade + 1 }); //moves made is increment
                    this.setState({ placeholderOppBoard: placeholder }); //opp placeholder board is updated
                }
            }
        };

        const newGame = () => {
            if (this.state.joinedRoom) {
                //check to see if a user has joined a game room
                const user = this.state.user;
                const room = 'connect';
                socket.emit('waiting', { user, room }); //emits the waiting command to the server
            }
        };

        const stopSearch = () => {
            if (this.state.joinedRoom) {
                //check to see if a user has joined a game room
                const user = this.state.user;
                const room = 'connect';
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

        const deploy = () => {
            let board = this.state.board; //gets the board
            let matchRoom = this.state.matchRoom; //gets the match room

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

            //removes all the ships and the ship container from the screen

            socket.emit('battleBoard', { board, matchRoom }); // the command battleBoard is emmited to the server with the board as an argument
            this.setState({ boardReady: false }); //board ready is set to false
        };

        let panels = [];
        let panelsOpp = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                //appends each panel to the screen using the placeholderBoard
                if (this.state.placeholderBoard[j][i] === 0) {
                    panels.push(<Panel key={j + i * 10} location={`${j}-${i}`}></Panel>); // if the value is 0 in the placeholder board display an empty panel
                }
                if (this.state.placeholderBoard[j][i] === 1) {
                    panels.push(<Panel key={j + i * 10} location={`${j}-${i}`} color={'orangered'}></Panel>); // if the value is 1 in the placeholder board display a red panel to show a hit
                }
                if (this.state.placeholderBoard[j][i] === 2) {
                    panels.push(<Panel key={j + i * 10} location={`${j}-${i}`} color={'#333'}></Panel>); // if the value is 2 in the placeholder board display a black to show a miss
                }
            }
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                //appends each panel to the screen using the oppPlaceholderBoard
                if (this.state.placeholderOppBoard[j][i] === 0) {
                    panelsOpp.push(<div key={j + i * 10} id={`-${j}-${i}`} className="shipPanel" onClick={handleMove}></div>); // if the value is 0 in the placeholder board display an empty panel
                }
                if (this.state.placeholderOppBoard[j][i] === 1) {
                    panelsOpp.push(<div key={j + i * 10} id={`-${j}-${i}`} className="shipPanel" onClick={handleMove} style={{ backgroundColor: 'orangered' }}></div>); // if the value is 1 in the placeholder board display a red panel to show a hit
                }
                if (this.state.placeholderOppBoard[j][i] === 2) {
                    panelsOpp.push(<div key={j + i * 10} id={`-${j}-${i}`} className="shipPanel" onClick={handleMove} style={{ backgroundColor: '#333' }}></div>); // if the value is 0 in the placeholder board display an empty panel
                }
            }
        }
        if (this.state.joinedMatch) {
            //checks if a match is joined
            return (
                <div style={{ width: '100%', height: '100vh' }}>
                    <DragDropContext onDragEnd={handleDrag}>
                        {/*initiates drag and droppable area*/}
                        <div className="homeBattlefield">
                            <h3 className={this.state.myMove ? ' userMove' : ''}>Home fleet</h3>
                            {this.state.myMove && <h4 className="userMove">Your move</h4>}
                            {/*highlighted depending on whos move it is*/}
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
                            {/*ships are displayed*/}
                            <div className={this.state.boardValid ? 'battlefield nonValid' : 'battlefield'}>{panels}</div>
                            {/*if the board isn't valid the outline of the gameboard goes red*/}
                            {this.state.boardReady && (
                                <button className="deploy" onClick={deploy}>
                                    {/*if the board is ready then the deploy fleet button is displayed*/}
                                    Deploy fleet
                                </button>
                            )}
                        </div>
                        <div id="oppBoard">
                            <h3 className={!this.state.myMove ? ' userMove' : ''}>Opponent fleet</h3>
                            {!this.state.myMove && <h4 className="userMove">Opponents move</h4>}
                            {/*highlighted depending on whos move it is*/}
                            <div className="battlefield">
                                {!this.state.opBoard && <div style={{ width: 'inherit', height: 'inherit', backgroundColor: 'rgba(0,0,0,0.4)', color: 'white' }}>waiting</div>}

                                {this.state.opBoard && panelsOpp}
                                {/*displays the opponents battlefield*/}
                            </div>
                        </div>
                    </DragDropContext>
                    {this.state.won && ( //checks if the user has won
                        <div className="endScreen">
                            {/*displays corresponding endscreen*/}
                            <h3>You Won</h3>
                            <Link to="/games" className="btn">
                                {/*link goes back to games*/}
                                Back to games
                            </Link>
                        </div>
                    )}
                    {this.state.draw && ( //checks if the user has drawn
                        <div className="endScreen">
                            {/*displays corresponding endscreen*/}
                            <h3>Draw</h3>
                            <Link to="/games" className="btn">
                                {/*link goes back to games*/}
                                Back to games
                            </Link>
                        </div>
                    )}
                    {this.state.lost && ( //checks if the user has lost
                        <div className="endScreen">
                            {/*displays corresponding endscreen*/}
                            <h3>You Lost</h3>
                            <Link to="/games" className="btn">
                                {/*link goes back to games*/}
                                Back to games
                            </Link>
                        </div>
                    )}
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
                    <h3 className="popGames">Battleships</h3>
                    <div className="divider"></div>
                    {this.state.user && !this.state.loading && (
                        <div>
                            <button className="btn" onClick={newGame}>
                                {/*when clicked a the user searches for a new game*/}
                                Find Match
                            </button>
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
    stats: state.statistics.stats,
    opponent: state.opponent,
});

BattleGame.propTypes = {
    //defines the types of each prop so no unwanted errors occur
    user: PropTypes.object.isRequired,
    statistics: PropTypes.object.isRequired,
    opponent: PropTypes.object.isRequired,
    setOpponent: PropTypes.func.isRequired,
    setUserStats: PropTypes.func.isRequired,
    getUserStats: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { setOpponent, setUserStats, getUserStats })(BattleGame); //connect links react and redux together so they can be used together
