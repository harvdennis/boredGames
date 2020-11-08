import { SET_OPPONENT, SET_ERRORS, CLEAR_ERRORS, LOADING_UI } from '../types';
import firebase from './../../services/util/config';
import 'firebase/auth';
import 'firebase/firestore';

const db = firebase.firestore();
const realdb = firebase.database();

export const setOpponent = (user) => (dispatch) => {
    let userData = {};
    dispatch({ type: LOADING_UI });
    db.doc(`/users/${user}`)
        .get()
        .then((doc) => {
            userData.opponent = doc.data();
            if (doc.exists) {
                dispatch({ type: SET_OPPONENT, payload: userData });
                dispatch({ type: CLEAR_ERRORS });
            }
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: SET_ERRORS, payload: err });
        });
};
