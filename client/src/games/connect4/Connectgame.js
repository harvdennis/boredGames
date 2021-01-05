import React, { Component } from 'react'; //react and the components are imported from react
import { Link } from 'react-router-dom'; //Link is imported from react router
import { setOpponent } from '../../redux/actions/opponentActions'; //the redux funtion setOpponent is imported from the opponent actions
import { setUserStats, getUserStats } from '../../redux/actions/userActions'; // the redux funtions setUserStats and getUserStats are imported from the user actions
import io from 'socket.io-client'; //the socket io client is imported
import PropTypes from 'prop-types'; //PropTypes are imported
import { connect } from 'react-redux'; // connect is imported to allow the page to speak to redux
import ConnectBoard from './ConnectBoard'; //the board is imported
import './connectboard.css'; //the connect 4 styles are imported

let socket; //delare the socket variable

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
            const room = 'connect';
            console.log(`${user} joining ${room}`);
            socket.emit('joinRoom', { user, room }); //emits the joinRoom command, this is to show the user as an online player in the game room
            this.setState({ user: this.props.user.credentials.handle }); // the user state varible is updated
        }
    }

    componentDidMount() {
        //socket = io('http://192.168.1.106:5000' || 'http://localhost:5000'); //use when developing
        socket = io(); // use when deploying to heroku

        if (this.props.user.credentials.handle) {
            //checks to see if the props have been loaded
            socket.emit('disconnected'); //makes sure the user is initially disconnected, they dont want to be connected twice
            const user = this.props.user.credentials.handle;
            const room = 'connect';
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
            }); //the current board is cleared
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
            //listens for the sendmove command from the server
            this.onlineMove(move); //calls the onliene move funtion with the move as an argument
            this.gameOver(move); //checks if the game is finished
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
        this.setState({ currentBoard: move }); // the board is updated
        this.setState({ myMove: true }); //my move set to true
        console.log('moved');
    }

    updateStats(win) {
        let finalTime = new Date(); //get the end time of the match
        let elapsed = (finalTime.getTime() - this.state.startTime.getTime()) / 1000; //calculates the elapsed time of the match
        let placeholder = this.props.stats; //gets the users stats and puts them into a placeholder variable
        placeholder.connect4.gamesPlayed = placeholder.connect4.gamesPlayed + 1; //gamesPlayed incremented by one
        placeholder.connect4.hoursPlayed = placeholder.connect4.hoursPlayed + elapsed; //elapsed time added to total time
        placeholder.connect4.movesMade = placeholder.connect4.movesMade + this.state.movesMade; //total moves made added to the total moves made
        if (win) {
            //checks if the user won
            placeholder.connect4.gamesWon = placeholder.connect4.gamesWon + 1; //games won is incremented
            placeholder.connect4.winTimes = placeholder.connect4.winTimes + elapsed; //elapsed time is added to total win time
            placeholder.connect4.winMoves = placeholder.connect4.winMoves + this.state.movesMade; // moves made is added to total winning moves
            placeholder.recent.winLoss = 'Win';
        } else {
            //checks if the user has lost
            placeholder.recent.winLoss = 'Loss'; //recent Winloss is set to loss
        }
        placeholder.recent.game = 'Connect 4';
        placeholder.recent.movesMade = this.state.movesMade;
        placeholder.recent.opponent = this.props.opponent.opponent.handle;
        placeholder.recent.timePlayed = elapsed;
        //all the recent stats are updated with the corresponding data
        this.props.setUserStats(placeholder); //the redux fucntion setUserStats is called with the placeholder as a argument
    }

    gameOver(board) {
        //this funtion checks if the game is over. its very long and probably can be compacted
        let yellow;
        let red;
        let count;
        for (let i = 0; i < 7; i++) {
            //checks for 4 in a rows vetically
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
                    //checks for a draw
                    this.setState({ draw: true });
                    this.setState({ myMove: false });
                    this.updateStats(false);
                }
            }
        }

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                //checks for 4 in a rows horisontally
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
                //checks for 4 in a rows diagonally
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
                //checks for 4 in a rows diagonally
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
                //checks for 4 in a rows diagonally
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
                //checks for 4 in a rows diagonally
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

        const handleClick = (e) => {
            let targetCol = e.target.id; //gets the id of the column clicked
            let matchRoom = this.state.matchRoom;
            let colour;
            let allowMove = false;
            if (this.state.player === 'white') {
                colour = 1;
            } else {
                colour = 2;
            } //the number represents red for 1 and 2 for yellow
            targetCol = parseInt(targetCol); //converts the coulumn name to integer
            let currentmove = this.state.currentBoard;
            for (let i = 5; i >= 0; i--) {
                if (currentmove[targetCol][i] === 0) {
                    //checks if space is empty
                    currentmove[targetCol][i] = colour;
                    allowMove = true; //appends a disc to the bottom of the array (column)
                    break;
                }
            }

            if (this.state.myMove && allowMove) {
                //checks if move is valid
                this.setState({ movesMade: this.state.movesMade + 1 }); //moves made is incremented
                socket.emit('sendMove', { currentmove, matchRoom }); //the commeand send move is sent to the server with the move as an argument
                this.setState({ currentBoard: currentmove }); //the current board is updated
                this.setState({ myMove: false }); //my move is set to false
                this.gameOver(currentmove); //check if the game is over
            }
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
                        <div className="interactive">
                            <div className="clickDetect">
                                <div className="clicker" id="0col" onClick={handleClick}></div>
                                {/*the clickers overlay over each column so the user can click any where on a column for a move to be made*/}
                                <div className="clicker" id="1col" onClick={handleClick}></div>
                                <div className="clicker" id="2col" onClick={handleClick}></div>
                                <div className="clicker" id="3col" onClick={handleClick}></div>
                                <div className="clicker" id="4col" onClick={handleClick}></div>
                                <div className="clicker" id="5col" onClick={handleClick}></div>
                                <div className="clicker" id="6col" onClick={handleClick}></div>
                            </div>
                            <ConnectBoard currentBoard={this.state.currentBoard} />
                            {/*The board is displayed*/}
                        </div>
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
                    <h3 className="popGames">Connect</h3>
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

Connectgame.propTypes = {
    //defines the types of each prop so no unwanted errors occur
    user: PropTypes.object.isRequired,
    statistics: PropTypes.object.isRequired,
    opponent: PropTypes.object.isRequired,
    setOpponent: PropTypes.func.isRequired,
    setUserStats: PropTypes.func.isRequired,
    getUserStats: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { setOpponent, setUserStats, getUserStats })(Connectgame); //connect links react and redux together so they can be used together
