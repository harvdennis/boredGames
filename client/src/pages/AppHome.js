import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logoutUser } from '../redux/actions/userActions';
import { searchUser, checkFriend, addFriend, getFriends } from '../redux/actions/friendActions';
import Person from './../components/Person';
import Loader from './../components/Loader';
import './../styles/App.css';
import './../styles/games.css';
import settings from './../styles/settings-24px.svg';
import close from './../styles/close.svg';
import chess from './game-imgs/chess.PNG';
import firebase from '../services/util/config';

const realdb = firebase.database();

export class AppHome extends Component {
    constructor() {
        super();
        this.state = {
            users: '',
            friends: [],
            openFriend: true,
        };
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.checkFriend(this.state.users);
        this.props.searchUser(this.state.users);
        this.setState({ openFriend: true });
    };

    addFriend = () => {
        this.props.addFriend(this.props.searchedFriend.handle);
    };

    logout = () => {
        this.props.logoutUser();
    };

    closeFriend = () => {
        this.setState({ openFriend: false });
    };

    render() {
        let friends;
        let friendArr;
        if (typeof this.props.friendList === 'string') {
            friends = this.props.friendList;
        } else {
            friendArr = Object.values(this.props.friendData);
            let i = -1;
            friends = friendArr.map((friend) => {
                i++;
                return (
                    <li key={i}>
                        <img src={friend.imageUrl} alt="icon" className={`icon ${friend.status}`} /> {friend.handle} <a> {friend.status}</a>
                    </li>
                );
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
                                <img className="settings" src={settings} alt="settings" />
                            </div>
                        </li>
                    </ul>
                </nav>
                <div className="contain">
                    <h3 className="popGames">Popular games</h3>
                    <div className="divider"></div>
                    <div className="games">
                        <Link to="/games/chess" className="game-link">
                            <div className="selector">
                                <img src={chess} alt="chess" className="selector-img" />
                            </div>
                        </Link>
                        <Link to="/games/connect" className="game-link">
                            <div className="selector">
                                <img src={chess} alt="chess" className="selector-img" />
                            </div>
                        </Link>
                    </div>
                    <Link to="/games">
                        <button className="moreGames">See All Games</button>
                    </Link>
                </div>
                <div className="people">
                    <div className="searchUsers">
                        <form noValidate onSubmit={this.handleSubmit}>
                            <input value={this.state.users} id="users" type="text" name="users" className="input" placeholder="search users" onChange={this.handleChange} />
                        </form>
                    </div>
                    <div className="friendContain">
                        <h3>Friends</h3>
                        <div className="divider"></div>

                        <ul className="friends">{friends}</ul>
                        {this.props.UI.errors && this.state.openFriend && (
                            <div className="searchedFriend" onClick={this.closeFriend}>
                                <img id="close" src={close} />
                                <h3>{this.props.UI.errors.friends}</h3>
                            </div>
                        )}
                        {this.props.searchedFriend.handle && !this.props.UI.errors && this.state.openFriend && (
                            <div className="searchedFriend" onClick={this.closeFriend}>
                                <img id="close" src={close} />
                                <h3>{this.props.searchedFriend.handle}</h3>
                                <img src={this.props.searchedFriend.imageUrl} alt="icon" />
                                {this.props.isFriend && <button onClick={this.addFriend}>Add Friend ➕</button>}
                            </div>
                        )}
                        {this.props.UI.loading && (
                            <div className="searchedFriend">
                                <Loader size="75px" ball="15px" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    authenticated: state.user.authenticated,
    UI: state.UI,
    credentials: state.user.credentials,
    friendList: state.friends.friendList,
    friendData: state.friends.friendData,
    searchedFriend: state.friends.searchedFriend,
    isFriend: state.friends.isFriend,
});

AppHome.propTypes = {
    user: PropTypes.object,
    UI: PropTypes.object.isRequired,
    friends: PropTypes.object,
    logoutUser: PropTypes.func.isRequired,
    searchUser: PropTypes.func.isRequired,
    checkFriend: PropTypes.func.isRequired,
    addFriend: PropTypes.func.isRequired,
    getFriends: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, { logoutUser, checkFriend, searchUser, addFriend, getFriends })(AppHome);
