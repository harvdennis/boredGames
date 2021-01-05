import React, { Component } from 'react'; //react and the react component is imported from react library
import { Link } from 'react-router-dom'; //allows for page linking
import { connect } from 'react-redux'; //connects react with redux
import PropTypes from 'prop-types';
import { logoutUser, deleteUser } from '../redux/actions/userActions'; //imported user redux funtions
import { searchUser, checkFriend, addFriend, getFriends } from '../redux/actions/friendActions'; //imported friend redux functions
import Loader from './../components/Loader'; //loader component imported
import './../styles/App.css'; //app styles
import './../styles/games.css'; //game styles
import settings from './../styles/settings-24px.svg'; //settings icon
import close from './../styles/close.svg'; //close icon
import chess from './game-imgs/chess.PNG'; //chess image
import connect4 from './game-imgs/connect4.PNG'; //connect 4 image
import battleship from './game-imgs/battleship.PNG'; //battleships image
import firebase from '../services/util/config'; //firebase is imported

export class AppHome extends Component {
    constructor() {
        super();
        this.state = {
            users: '',
            friends: [],
            settings: false,
            openFriend: true,
        };
    }

    handleChange = (e) => {
        //funtion used to allow inputs to work
        this.setState({
            [e.target.name]: e.target.value, //this funtion is called after every keystroke and updates the value of each input
        });
    };

    handleSubmit = (e) => {
        e.preventDefault(); //stop the page from refreshing
        if (this.state.users === '') {
            //does nothing if the input is nothing
        } else {
            this.props.checkFriend(this.state.users); //calls the redux fundtion checkFreind
            this.props.searchUser(this.state.users); //call the redux funtion searchUser
            this.setState({ openFriend: true }); //sets open Friend to true
        }
    };

    addFriend = () => {
        this.props.addFriend(this.props.searchedFriend.handle); //calls the redux function addFriend
    };

    logout = () => {
        this.props.logoutUser(); //calls the redux funtion logout user
    };

    delete = () => {
        this.props.deleteUser(); //calls the redux funtion delete user
    };

    closeFriend = () => {
        this.setState({ openFriend: false }); //sets open friend to false
    };

    render() {
        let friends;
        let friendArr;
        let stats;
        if (this.props.stats.recent) {
            //checks if the recent stats have loaded
            stats = this.props.stats; //sets the variable stats to the recent stats
        } else {
            stats = false; //sets stats to false if recent stats havnt loaded
        }
        if (typeof this.props.friendList === 'string') {
            //checks if the user has any friends
            friends = this.props.friendList;
        } else {
            friendArr = Object.values(this.props.friendData); //gets the object values (the users friends)
            let i = -1;
            friends = friendArr.map((friend) => {
                i++;
                return (
                    <li key={i}>
                        <img src={friend.imageUrl} alt="icon" className={`icon ${friend.status}`} /> {friend.handle} <a> {friend.status}</a>
                    </li>
                ); //maps all the users friends to an array
            });
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
                        <li className="profile">
                            <div className="profileContain">
                                <img className="icon" src={this.props.credentials.imageUrl} alt="icon" />
                                <h3>{this.props.credentials.handle}</h3>
                                <div className="verticalDivide"></div>
                                <Link to="/" className="logout" onClick={this.logout}>
                                    <h3>Logout</h3>
                                </Link>
                                <img
                                    className={this.state.settings ? 'settings set-rotate' : 'settings'}
                                    src={settings}
                                    onClick={() => {
                                        this.setState({ settings: !this.state.settings });
                                        //when clicked invert the settings value
                                    }}
                                    alt="settings"
                                />
                            </div>
                        </li>
                    </ul>
                </nav>
                {this.state.settings && (
                    <div className="delAcc" onClick={this.delete}>
                        <h3>Delete Account</h3>
                    </div>
                )}
                {/*if the settings state is true show the delete account button*/}
                <div className="contain">
                    <h3 className="popGames">Popular games</h3>
                    <div className="divider"></div>
                    <div className="games">
                        {/*Where the top three games are displayed*/}
                        <Link to="/games/chess" className="game-link">
                            <div className="selector">
                                <img src={chess} alt="chess" className="selector-img" />
                            </div>
                        </Link>
                        <Link to="/games/connect" className="game-link">
                            <div className="selector">
                                <img src={connect4} alt="connect4" className="selector-img" />
                            </div>
                        </Link>
                        <Link to="/games/battle" className="game-link">
                            <div className="selector">
                                <img src={battleship} alt="connect4" className="selector-img" />
                            </div>
                        </Link>
                    </div>
                    <Link to="/games">
                        {/*link to see all games*/}
                        <button className="moreGames">See All Games</button>
                    </Link>
                </div>
                <div className="contain">
                    <h3 className="popGames">Recent Stats</h3>
                    <div className="divider"></div>
                    <div className="statsList">
                        <h3 className="stat">Game: {stats ? stats.recent.game : 'Loading...'}</h3>
                        <h3 className="stat">Opponent: {stats ? stats.recent.opponent : 'Loading...'}</h3>
                        <h3 className="stat">Outcome: {stats ? stats.recent.winLoss : 'Loading...'}</h3>
                        <h3 className="stat">Moves Made: {stats ? stats.recent.movesMade : 'Loading...'}</h3>
                        <h3 className="stat">Time Played: {stats ? stats.recent.timePlayed.toFixed(0) : 'Loading...'} seconds</h3>
                        {/*if the user's stats have loaded then they are displayed*/}
                    </div>
                    <Link to="/stats">
                        {/*link to see all stats*/}
                        <button className="moreGames">See More Statistics</button>
                    </Link>
                </div>
                <div className="people">
                    <div className="searchUsers">
                        <form noValidate onSubmit={this.handleSubmit}>
                            {/*calls handle submit on submit*/}
                            <input value={this.state.users} id="users" type="text" name="users" className="input" placeholder="search users" onChange={this.handleChange} />
                            {/*used to search for users*/}
                        </form>
                    </div>
                    <div className="friendContain">
                        <h3>Friends</h3>
                        <div className="divider"></div>

                        <ul className="friends">{friends}</ul>
                        {/*diplays the users friends*/}
                        {this.props.UI.errors && this.state.openFriend && (
                            <div className="searchedFriend" onClick={this.closeFriend}>
                                <img id="close" src={close} />
                                <h3>{this.props.UI.errors.friends}</h3>
                            </div>
                        )}
                        {/*displays a searched user who is already the users friend*/}
                        {this.props.searchedFriend.handle && !this.props.UI.errors && this.state.openFriend && (
                            <div className="searchedFriend" onClick={this.closeFriend}>
                                <img id="close" src={close} />
                                <h3>{this.props.searchedFriend.handle}</h3>
                                <img src={this.props.searchedFriend.imageUrl} alt="icon" />
                                {this.props.isFriend && <button onClick={this.addFriend}>Add Friend ➕</button>}
                            </div>
                        )}
                        {/*displays a searched user who is not the users friend*/}
                        {this.props.UI.loading && (
                            <div className="searchedFriend">
                                <Loader size="75px" ball="15px" />
                            </div>
                        )}
                        {/*displayed while loading a user*/}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    //maps the redux state to the components props
    authenticated: state.user.authenticated,
    UI: state.UI,
    credentials: state.user.credentials,
    stats: state.statistics.stats,
    friendList: state.friends.friendList,
    friendData: state.friends.friendData,
    searchedFriend: state.friends.searchedFriend,
    isFriend: state.friends.isFriend,
});

AppHome.propTypes = {
    //defines the types of each prop so no unwanted errors occur
    user: PropTypes.object,
    UI: PropTypes.object.isRequired,
    friends: PropTypes.object,
    statistics: PropTypes.object.isRequired,
    logoutUser: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired,
    searchUser: PropTypes.func.isRequired,
    checkFriend: PropTypes.func.isRequired,
    addFriend: PropTypes.func.isRequired,
    getFriends: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { deleteUser, logoutUser, checkFriend, searchUser, addFriend, getFriends })(AppHome); //connect links react and redux together so they can be used together
