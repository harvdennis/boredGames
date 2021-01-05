import { SET_USER, SET_STATS, SET_ERRORS, CLEAR_ERRORS, LOADING_UI, SET_UNAUTHENTICATED } from '../types'; //types used in the functions are imported
import firebase from './../../services/util/config'; //firebase is imported
import 'firebase/auth'; //firebase authenctication is imported
import 'firebase/firestore'; //firebase firestore is imported
import { validateSignupData, validateLoginData } from './../../services/util/validators'; //validators are imported to validate the inputs

const db = firebase.firestore(); //firestore initialised
const auth = firebase.auth(); //authentication initialised
const realdb = firebase.database(); //realtime db initialesed

export const loginUser = (userData, history) => (dispatch) => {
    //funtion used to login a user
    dispatch({ type: LOADING_UI });

    const { valid, errors } = validateLoginData(userData); //validates the login inputs

    if (!valid) {
        dispatch({ type: SET_ERRORS, payload: errors }); //if the login isn't valid errors are thrown
    } else {
        auth.signInWithEmailAndPassword(userData.email, userData.password) //the firebase function is used login the user
            .then(() => {
                dispatch(getUserData()); //the users details are fetched
                dispatch(getUserStats()); // the users stats are fetched
                dispatch({ type: CLEAR_ERRORS }); //errors are cleared
                history.push('/app'); //the user is redirected to the dashboard
            })
            .catch((err) => {
                let general = {
                    general: 'Wrong credentials, please try again',
                }; //error is displayed
                dispatch({ type: SET_ERRORS, payload: general });
            });
    }
};

export const signupUser = (newUserData, history) => (dispatch) => {
    //function is used to sign up a user
    dispatch({ type: LOADING_UI });
    let userId;
    const noImg = 'no-img.png';
    const { valid, errors } = validateSignupData(newUserData); //validates the sign up inputs

    if (!valid) {
        dispatch({ type: SET_ERRORS, payload: errors }); //if the sign up isn't valid errors are thrown
    } else {
        db.doc(`/users/${newUserData.handle}`)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    //checks if the username is taken if so an error is thrown
                    let general = {
                        general: 'this username already exists',
                    };
                    dispatch({ type: SET_ERRORS, payload: general });
                } else {
                    return auth.createUserWithEmailAndPassword(newUserData.email, newUserData.password); //if the inputs are valid and the username isn't taken the user is created using the firebase function
                }
            })
            .then((data) => {
                userId = data.user.uid; //the userId is fetched from the firebase function
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
                }; //the users credentials and startind stats are configured
                db.doc(`/users/${newUserData.handle}`).set(userCredentials); //a new user is made in the database
                db.doc(`/stats/${newUserData.handle}`).set(stats); //the users stats are created in the database
                dispatch(getUserData()); //the users details are fetched
                dispatch(getUserStats()); //the users stats are fetched
                dispatch({ type: CLEAR_ERRORS });
                history.push('/app'); //user is redirected to the dashboard
            })
            .catch((err) => {
                console.error(err);
                if (err.code === 'auth/email-already-in-use') {
                    let general = {
                        general: 'email already in use',
                    }; //lets the user know the email is already in use
                    dispatch({ type: SET_ERRORS, payload: general }); //sets the error
                } else {
                    let general = {
                        general: 'this username already exists',
                    }; //lets the user know that the username is in use
                    dispatch({ type: SET_ERRORS, payload: general }); //sets the error
                }
            });
    }
};

export const logoutUser = () => (dispatch) => {
    //used to logout the user
    firebase
        .auth()
        .signOut() //signs the user out
        .then(() => {
            dispatch({ type: SET_UNAUTHENTICATED }); //sets the user as unauthenticated
        })
        .catch(function (err) {
            dispatch({ type: SET_ERRORS, payload: err.message }); //displays any errors
        });
};

export const deleteUser = () => (dispatch) => {
    //used to delete user accounts
    let handle;
    var user = firebase.auth().currentUser; //gets the logged in users uid
    realdb.ref(`/status/${user.uid}`).remove();
    db.collection('users')
        .where('userId', '==', user.uid)
        .limit(1)
        .get()
        .then((data) => {
            //gets the users handle
            handle = data.docs[0].data().handle;
            db.collection('stats').doc(`${handle}`).delete();
            db.collection('users').doc(`${handle}`).delete(); //deletes the users stats and credentials
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err.code }); //displays any errors if any
        });

    user.delete() //delets the users account
        .then(function () {
            dispatch({ type: SET_UNAUTHENTICATED }); //the user is set to unauthenticated
        })
        .catch(function (err) {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err.code }); //errors are displayed if any
        });
};

export const getUserData = () => (dispatch) => {
    //gets the users credentials
    var user = firebase.auth().currentUser; //gets the logged in users uid
    let uid;
    let userData = {};

    if (user != null) {
        //checks if the user is logged in
        uid = user.uid;
        db.collection('users')
            .where('userId', '==', uid)
            .limit(1)
            .get() //gets the user credentials
            .then((data) => {
                userData.credentials = data.docs[0].data();
                dispatch({ type: SET_USER, payload: userData }); //dispatched the redux type set user
            })
            .catch((err) => {
                console.error(err);
                dispatch({ type: SET_ERRORS, payload: err.message }); //errors are displayed if any
            });
    }
};

export const getUserStats = () => (dispatch) => {
    var user = firebase.auth().currentUser; //gets the logged in users uid
    let uid;
    let userData = {};

    if (user != null) {
        //checks if the user is logged
        uid = user.uid;
        db.collection('stats')
            .where('userId', '==', uid)
            .limit(1)
            .get() //gets the users stats
            .then((data) => {
                userData.stats = data.docs[0].data();
                dispatch({ type: SET_STATS, payload: userData }); //dispatches the redux type set stats
            })
            .catch((err) => {
                console.error(err);
                dispatch({ type: SET_ERRORS, payload: err.message }); //errors are displayed if any
            });
    }
};

export const setUserStats = (stats) => (dispatch) => {
    const user = firebase.auth().currentUser.uid; //gets the logged in users uid
    let handle;
    db.collection('users')
        .where('userId', '==', user)
        .limit(1)
        .get() //gets the users username
        .then((data) => {
            handle = data.docs[0].data().handle;
            db.collection('stats')
                .doc(`${handle}`)
                .set(stats)
                .then(() => {
                    //sets the users new stats
                    dispatch(getUserStats()); //gets the updated stats from the database
                });
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err.code }); //errors are displayed if any
        });
};
