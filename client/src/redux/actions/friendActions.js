import { SET_FRIEND, SET_FRIENDS, SEARCH_FRIEND, IS_FRIEND, NOT_FRIEND, SET_ERRORS, CLEAR_ERRORS, LOADING_UI, APPEND_FRIEND } from '../types';
import firebase from './../../services/util/config';
import 'firebase/auth';
import 'firebase/firestore';

const db = firebase.firestore();
const realdb = firebase.database();

export const checkFriend = (friend) => (dispatch) => {
    const user = firebase.auth().currentUser.uid;
    let handle;
    db.collection('users')
        .where('userId', '==', user)
        .limit(1)
        .get()
        .then((data) => {
            handle = data.docs[0].data().handle;
            db.doc(`/relations/${handle}${friend}`)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        dispatch({ type: IS_FRIEND });
                    } else {
                        dispatch({ type: NOT_FRIEND });
                    }
                });
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err.code });
        });
};

export const searchUser = (user) => (dispatch) => {
    let userData = {};
    dispatch({ type: LOADING_UI });
    db.doc(`/users/${user}`)
        .get()
        .then((doc) => {
            userData.searchedFriend = doc.data();
            if (doc.exists) {
                dispatch({ type: SEARCH_FRIEND, payload: userData });
                dispatch({ type: CLEAR_ERRORS });
            } else {
                throw { friends: `${user} not found` };
            }
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err });
        });
};

export const getFriend = (user) => (dispatch) => {
    dispatch({ type: LOADING_UI });
    let data = {};
    db.doc(`/users/${user}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                const uid = doc.data().userId;
                const statusRef = realdb.ref('status/' + uid);
                statusRef.on('value', (snapshot) => {
                    if (snapshot.val()) {
                        data = { ...doc.data(), status: snapshot.val() };
                        dispatch({ type: APPEND_FRIEND, payload: data });
                    }
                });
            } else {
                throw { friends: `${user} not found` };
            }
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err });
        });
};

export const addFriend = (friend) => (dispatch) => {
    const user = firebase.auth().currentUser.uid;
    let handle;
    db.collection('users')
        .where('userId', '==', user)
        .limit(1)
        .get()
        .then((data) => {
            handle = data.docs[0].data().handle;
            db.collection('relations')
                .doc(`${handle}${friend}`)
                .set({
                    from: `${handle}`,
                    to: `${friend}`,
                })
                .then(() => {
                    dispatch({ type: SET_FRIEND });
                    dispatch(getFriends());
                });
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err.code });
        });
};

export const getFriends = () => (dispatch) => {
    let resData = {};
    const user = firebase.auth().currentUser.uid;
    let friendList = [];

    let handle;

    db.collection('users')
        .where('userId', '==', user)
        .limit(1)
        .get()
        .then((data) => {
            handle = data.docs[0].data().handle;
            db.collection('relations')
                .where('from', '==', handle)
                .get()
                .then((relationships) => {
                    relationships.forEach((doc) => {
                        friendList.push(doc.data().to);
                        dispatch(getFriend(doc.data().to));
                    });
                })
                .then(() => {
                    resData.friendList = friendList;
                    if (friendList[0]) {
                        dispatch({ type: SET_FRIENDS, payload: resData });
                        dispatch({ type: CLEAR_ERRORS });
                    } else {
                        resData.friendList = 'You have no friends 😭';
                        dispatch({ type: SET_FRIENDS, payload: resData });
                        dispatch({ type: CLEAR_ERRORS });
                    }
                });
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err.code });
        });
};
