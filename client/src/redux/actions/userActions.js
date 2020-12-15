import { SET_USER, SET_STATS, SET_ERRORS, CLEAR_ERRORS, LOADING_UI, SET_UNAUTHENTICATED } from '../types';
import firebase from './../../services/util/config';
import 'firebase/auth';
import 'firebase/firestore';
import { validateSignupData, validateLoginData, reduceUserDetails } from './../../services/util/validators';

const db = firebase.firestore();
const auth = firebase.auth();
const realdb = firebase.database();

export const loginUser = (userData, history) => (dispatch) => {
    dispatch({ type: LOADING_UI });

    const { valid, errors } = validateLoginData(userData);

    if (!valid) {
        dispatch({ type: SET_ERRORS, payload: errors });
    } else {
        auth.signInWithEmailAndPassword(userData.email, userData.password)
            .then(() => {
                dispatch(getUserData());
                dispatch(getUserStats());
                dispatch({ type: CLEAR_ERRORS });
                history.push('/app');
            })
            .catch((err) => {
                dispatch({ type: SET_ERRORS, payload: 'Wrong credentials, please try again' });
            });
    }
};

export const signupUser = (newUserData, history) => (dispatch) => {
    dispatch({ type: LOADING_UI });
    let userId;
    const noImg = 'no-img.png';
    const { valid, errors } = validateSignupData(newUserData);

    if (!valid) {
        dispatch({ type: SET_ERRORS, payload: errors });
    } else {
        db.doc(`/users/${newUserData.handle}`)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    dispatch({ type: SET_ERRORS, payload: 'this username already exists' });
                } else {
                    return auth.createUserWithEmailAndPassword(newUserData.email, newUserData.password);
                }
            })
            .then((data) => {
                userId = data.user.uid;
            })
            .then(() => {
                const chess = {
                    gamesPlayed: 0,
                    hoursPlayed: 0,
                    gamesWon: 0,
                    winTimes: 0,
                    winMoves: 0,
                    movesMade: 0,
                };
                const connect4 = {
                    gamesPlayed: 0,
                    hoursPlayed: 0,
                    gamesWon: 0,
                    winTimes: 0,
                    winMoves: 0,
                    movesMade: 0,
                };
                const battleships = {
                    gamesPlayed: 0,
                    hoursPlayed: 0,
                    gamesWon: 0,
                    winTimes: 0,
                    winMoves: 0,
                    movesMade: 0,
                };
                const recent = {
                    timePlayed: 0,
                    winLoss: 'none',
                    movesMade: 0,
                    opponent: 'none',
                    game: 'none',
                };
                const stats = {
                    recent,
                    chess,
                    connect4,
                    battleships,
                    userId,
                };
                const userCredentials = {
                    handle: newUserData.handle,
                    joined: new Date().toISOString(),
                    imageUrl: `https://firebasestorage.googleapis.com/v0/b/boredgames-28c8e.appspot.com/o/${noImg}?alt=media`,
                    userId,
                };
                db.doc(`/users/${newUserData.handle}`).set(userCredentials);
                db.doc(`/stats/${newUserData.handle}`).set(stats);
                dispatch(getUserData());
                dispatch(getUserStats());
                dispatch({ type: CLEAR_ERRORS });
                history.push('/app');
            })
            .catch((err) => {
                console.error(err);
                if (err.code === 'auth/email-already-in-use') {
                    dispatch({ type: SET_ERRORS, payload: 'email already in use' });
                } else {
                    dispatch({ type: SET_ERRORS, payload: 'Something went wrong, please try again ' });
                }
            });
    }
};

export const logoutUser = () => (dispatch) => {
    var user = firebase.auth().currentUser;
    realdb.ref(`/status/${user.uid}`).set('offline');
    firebase
        .auth()
        .signOut()
        .then(() => {
            dispatch({ type: SET_UNAUTHENTICATED });
        })
        .catch(function (err) {
            dispatch({ type: SET_ERRORS, payload: err.message });
        });
};

export const getUserData = () => (dispatch) => {
    var user = firebase.auth().currentUser;
    let uid;
    let userData = {};

    if (user != null) {
        uid = user.uid;
        db.collection('users')
            .where('userId', '==', uid)
            .limit(1)
            .get()
            .then((data) => {
                userData.credentials = data.docs[0].data();
                dispatch({ type: SET_USER, payload: userData });
            })
            .catch((err) => {
                console.error(err);
                dispatch({ type: SET_ERRORS, payload: err.message });
            });
    }
};

export const getUserStats = () => (dispatch) => {
    var user = firebase.auth().currentUser;
    let uid;
    let userData = {};

    if (user != null) {
        uid = user.uid;
        db.collection('stats')
            .where('userId', '==', uid)
            .limit(1)
            .get()
            .then((data) => {
                userData.stats = data.docs[0].data();
                dispatch({ type: SET_STATS, payload: userData });
            })
            .catch((err) => {
                console.error(err);
                dispatch({ type: SET_ERRORS, payload: err.message });
            });
    }
};

export const setUserStats = (stats) => (dispatch) => {
    const user = firebase.auth().currentUser.uid;
    let handle;
    db.collection('users')
        .where('userId', '==', user)
        .limit(1)
        .get()
        .then((data) => {
            handle = data.docs[0].data().handle;
            db.collection('stats')
                .doc(`${handle}`)
                .set(stats)
                .then(() => {
                    dispatch(getUserStats());
                });
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err.code });
        });
};
