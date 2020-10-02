import React, { useEffect, useRef } from 'react';
import './styles/App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import AppHome from './pages/AppHome';
import Games from './pages/Games';
import chess from './games/chess/Chessgame';
import AuthRoute from './util/AuthRoute';
import AuthedRoute from './util/AuthedRoute';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Provider } from 'react-redux';
import store from './redux/store';
import { SET_AUTHENTICATED } from './redux/types';
import { getUserData, logoutUser } from './redux/actions/userActions';
import { getFriends } from './redux/actions/friendActions';
import firebase from './services/util/config';

const db = firebase.firestore();
const oldRealTimeDb = firebase.database();

const usersRef = db.collection('users'); // Get a reference to the Users collection;
const onlineRef = oldRealTimeDb.ref('.info/connected'); // Get a reference to the list of connections

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        onlineRef.on('value', (snapshot) => {
            oldRealTimeDb
                .ref(`/status/${user.uid}`)
                .onDisconnect()
                .set('offline')
                .then(() => {
                    oldRealTimeDb.ref(`/status/${user.uid}`).set('online');
                });
            window.onblur = () => {
                oldRealTimeDb
                    .ref(`/status/${user.uid}`)
                    .onDisconnect()
                    .set('offline')
                    .then(() => {
                        oldRealTimeDb.ref(`/status/${user.uid}`).set('away');
                    });
            };
            window.onfocus = () => {
                oldRealTimeDb
                    .ref(`/status/${user.uid}`)
                    .onDisconnect()
                    .set('offline')
                    .then(() => {
                        oldRealTimeDb.ref(`/status/${user.uid}`).set('online');
                    });
            };
        });
        store.dispatch({ type: SET_AUTHENTICATED });
        store.dispatch(getUserData());
        store.dispatch(getFriends());
    } else {
        store.dispatch(logoutUser());
    }
});

function App() {
    return (
        <Provider store={store}>
            <Router>
                <div className="App">
                    <AuthRoute exact path="/login" component={Login} />
                    <AuthRoute exact path="/signup" component={Signup} />
                    <div className="container">
                        <AuthRoute exact path="/" component={Home} />
                        <AuthedRoute exact path="/app" component={AppHome} />
                        <AuthedRoute exact path="/games" component={Games} />
                        <AuthedRoute path="/games/chess" component={chess} />
                    </div>
                </div>
            </Router>
        </Provider>
    );
}

export default App;
