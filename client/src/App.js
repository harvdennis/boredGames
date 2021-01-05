import React from 'react'; //importing the react library
import './styles/App.css'; //importing the applications styles
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import AppHome from './pages/AppHome';
import Games from './pages/Games';
import stats from './pages/Stats';
import chess from './games/chess/Chessgame';
import connect4 from './games/connect4/Connectgame';
import battleships from './games/battleships/BattleGame'; //importing each page of the application
import AuthRoute from './util/AuthRoute';
import AuthedRoute from './util/AuthedRoute'; //importing the custom route management for the application
import { BrowserRouter as Router } from 'react-router-dom'; //importing the react router module

import { Provider } from 'react-redux'; //imports the provider which "provides" the redux store
import store from './redux/store'; //imports the redux store
import { SET_AUTHENTICATED, SET_UNAUTHENTICATED } from './redux/types'; //importing the redux types which are used in the reducers
import { getUserData, getUserStats, logoutUser } from './redux/actions/userActions'; //importing the required redux funtions for the user
import { getFriends } from './redux/actions/friendActions'; //importing the redux function which gets the users friends
import firebase from './services/util/config'; // importing firebase

const oldRealTimeDb = firebase.database(); // set the firebase realtime database to a variable

const onlineRef = oldRealTimeDb.ref('.info/connected'); // Get a reference to the list of connections

firebase.auth().onAuthStateChanged(function (user) {
    //looks for a change in the users authentication state
    if (user) {
        // checks if the user is logged in
        onlineRef.on('value', (snapshot) => {
            oldRealTimeDb
                .ref(`/status/${user.uid}`)
                .onDisconnect()
                .set('offline') //if the user disconnects the status for the user is set to offline
                .then(() => {
                    oldRealTimeDb.ref(`/status/${user.uid}`).set('online'); //else the status for the user is set to online
                });
            window.onblur = () => {
                //listener to check if the window is not in the users focus
                oldRealTimeDb
                    .ref(`/status/${user.uid}`)
                    .onDisconnect()
                    .set('offline') //if the user disconnects the status for the user is set to offline
                    .then(() => {
                        oldRealTimeDb.ref(`/status/${user.uid}`).set('away'); //else the status for the user is set to away
                    });
            };
            window.onfocus = () => {
                //listener to check if the window is in the users focus
                oldRealTimeDb
                    .ref(`/status/${user.uid}`)
                    .onDisconnect()
                    .set('offline') //if the user disconnects the status for the user is set to offline
                    .then(() => {
                        oldRealTimeDb.ref(`/status/${user.uid}`).set('online'); //else the status for the user is set to online
                    });
            };
        });
        store.dispatch({ type: SET_AUTHENTICATED }); //as the user is logged in the SET_AUTHENTICATED type is dispatched, this sets the authenticated redux state to true
        store.dispatch(getUserData()); //the redux function getUserData is dispatched which gets the user data from firestore
        store.dispatch(getUserStats()); //the redux funtion getUserStats is dispatched which gets the user data from firestore
        store.dispatch(getFriends()); //the redux funtion getFriends is dispatched which gets the users friends from firestore
    } else {
        store.dispatch({ type: SET_UNAUTHENTICATED }); //the user is not logged in sto the SET_UNAUTHENTICATED type is dispatched, this sets the authenticated redux state to false
        store.dispatch(logoutUser()); //the redux funtion logoutUser is dispatched which logs out the user and redirects them to the home page
    }
});

function App() {
    return (
        //application layout which contains every page in the application
        <Provider store={store}>
            {' '}
            {/*The redux provider wraps the entire application so the redux variables can be accessed from anywhere*/}
            <Router>
                {' '}
                {/*The router has to wrap all the pages so it can dictate which one is being displayed at any current time*/}
                <div className="App">
                    <AuthRoute exact path="/login" component={Login} />
                    {/*AuthRoute means that the user can't be authenticated to be able to view the page*/}
                    <AuthRoute exact path="/signup" component={Signup} />
                    {/*the path tells the router which url the page should be diplayed on and the component tells the router which page should be dispalyed*/}
                    <div className="container">
                        <AuthRoute exact path="/" component={Home} />
                        <AuthedRoute exact path="/app" component={AppHome} />
                        {/*AuthedRoute means that the user has to be authenticated to be able to view the page*/}
                        <AuthedRoute exact path="/games" component={Games} />
                        <AuthedRoute exact path="/stats" component={stats} />
                        <AuthedRoute path="/games/chess" component={chess} />
                        <AuthedRoute path="/games/connect" component={connect4} />
                        <AuthedRoute path="/games/battle" component={battleships} />
                    </div>
                </div>
            </Router>
        </Provider>
    );
}

export default App; //export allows the component App to be imported into another js file.
