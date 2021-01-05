import { SET_OPPONENT, SET_ERRORS, CLEAR_ERRORS, LOADING_UI } from '../types'; //types used in the functions are imported
import firebase from './../../services/util/config'; //firebase is imported
import 'firebase/auth'; //firebase authenctication is imported
import 'firebase/firestore'; //firebase firestore is imported

const db = firebase.firestore(); //firestore is initialised

export const setOpponent = (user) => (dispatch) => {
    //sets the opponent the user is facing
    let userData = {};
    dispatch({ type: LOADING_UI });
    db.doc(`/users/${user}`)
        .get()
        .then((doc) => {
            //gets the users data
            userData.opponent = doc.data();
            if (doc.exists) {
                dispatch({ type: SET_OPPONENT, payload: userData }); //dispatches set opponent with the data as an argument
                dispatch({ type: CLEAR_ERRORS });
            }
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err }); //errors are displayed if there are any
        });
};
