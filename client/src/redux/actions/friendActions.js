import { SET_FRIEND, SET_FRIENDS, SEARCH_FRIEND, IS_FRIEND, NOT_FRIEND, SET_ERRORS, CLEAR_ERRORS, LOADING_UI, APPEND_FRIEND } from '../types'; //types used in the functions are imported
import firebase from './../../services/util/config'; //firebase is imported
import 'firebase/auth'; //firebase authenctication is imported
import 'firebase/firestore'; //firebase firestore is imported

const db = firebase.firestore(); //firestore is initialised
const realdb = firebase.database(); //realtime database is initialised

export const checkFriend = (friend) => (dispatch) => {
    //function that checks if a user is someones friend
    const user = firebase.auth().currentUser.uid; //gets the logged in user's uid
    let handle;
    db.collection('users')
        .where('userId', '==', user)
        .limit(1)
        .get() //gets users where userId is equal to the uid
        .then((data) => {
            handle = data.docs[0].data().handle; //gets the username of the user
            db.doc(`/relations/${handle}${friend}`) //checks if a relation is between the parameter and the user
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        dispatch({ type: IS_FRIEND }); //if there is a relationship the IS_FRIEND type is dispatched
                    } else {
                        dispatch({ type: NOT_FRIEND }); //if there isn't a relationship the NOT_FRIEND type is dispatched
                    }
                });
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err.code }); //if there are any errors they are displayed
        });
};

export const searchUser = (user) => (dispatch) => {
    //funtion that searches for a user
    let userData = {};
    dispatch({ type: LOADING_UI });
    db.doc(`/users/${user}`)
        .get() //gets the searched user
        .then((doc) => {
            userData.searchedFriend = doc.data();
            if (doc.exists) {
                //checks if the document exists
                dispatch({ type: SEARCH_FRIEND, payload: userData }); //the SEARCH_FRIEND type is dispatched with the data fetched from the database
                dispatch({ type: CLEAR_ERRORS }); //clears errors
            } else {
                throw { friends: `${user} not found` }; //if the user does not exist an error is thrown
            }
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err }); //if there are any errors they are displayed
        });
};

export const getFriend = (user) => (dispatch) => {
    //gets the users friends
    dispatch({ type: LOADING_UI }); //tells the ui its loading
    let data = {};
    db.doc(`/users/${user}`)
        .get() //gets the user from the database
        .then((doc) => {
            if (doc.exists) {
                //checks if the user exits
                const uid = doc.data().userId;
                const statusRef = realdb.ref('status/' + uid);
                statusRef.on('value', (snapshot) => {
                    if (snapshot.val()) {
                        data = { ...doc.data(), status: snapshot.val() };
                        dispatch({ type: APPEND_FRIEND, payload: data });
                    }
                }); //listens to updates in the realtime database on the users status
            } else {
                throw { friends: `${user} not found` }; //if the user does not exist an error is thrown
            }
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err }); //if there are any errors they are displayed
        });
};

export const addFriend = (friend) => (dispatch) => {
    //funtion used to add a friend
    const user = firebase.auth().currentUser.uid; //gets the logged in user's uid
    let handle;
    db.collection('users')
        .where('userId', '==', user)
        .limit(1)
        .get()
        .then((data) => {
            handle = data.docs[0].data().handle; //gets the username of the logged in user
            db.collection('relations')
                .doc(`${handle}${friend}`) //creates a reation between the user and the new friend
                .set({
                    from: `${handle}`,
                    to: `${friend}`,
                })
                .then(() => {
                    dispatch({ type: SET_FRIEND }); //the type set friend is dispatched which updates the users friend list
                    dispatch(getFriends()); //the redux function get friends is called which gets the new friend
                });
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err.code }); //if there are any errors they are displayed
        });
};

export const getFriends = () => (dispatch) => {
    let resData = {};
    const user = firebase.auth().currentUser.uid; //gets the logged in user's uid
    let friendList = [];

    let handle;

    db.collection('users')
        .where('userId', '==', user)
        .limit(1)
        .get()
        .then((data) => {
            handle = data.docs[0].data().handle; //gets the username of the logged in user
            db.collection('relations')
                .where('from', '==', handle) //finds all the relations the user has
                .get()
                .then((relationships) => {
                    relationships.forEach((doc) => {
                        //loops through all of the users friends
                        friendList.push(doc.data().to); //pushes each friend to an array
                        dispatch(getFriend(doc.data().to)); //gets each friend
                    });
                })
                .then(() => {
                    resData.friendList = friendList;
                    if (friendList[0]) {
                        dispatch({ type: SET_FRIENDS, payload: resData }); //SET_FRIEND is dispatched with the friends list as the argument
                        dispatch({ type: CLEAR_ERRORS });
                    } else {
                        resData.friendList = 'You have no friends 😭'; //if the user has no friends SET_FRIENDS is dispatched with this string
                        dispatch({ type: SET_FRIENDS, payload: resData });
                        dispatch({ type: CLEAR_ERRORS });
                    }
                });
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err.code }); //if there are any errors they are displayed
        });
};
