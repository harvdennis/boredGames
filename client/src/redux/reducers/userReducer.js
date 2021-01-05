import { SET_USER, SET_AUTHENTICATED, SET_UNAUTHENTICATED } from '../types'; //types used are imported

const initialState = {
    authenticated: false,
    credentials: {},
}; //the values for the intitial state

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_AUTHENTICATED:
            return {
                ...state,
                authenticated: true,
            }; //the user is authenticated
        case SET_UNAUTHENTICATED:
            return initialState; //credentials is cleared and authenticated is set to false
        case SET_USER:
            return {
                authenticated: true,
                ...action.payload,
            }; //the credentials of the user is set
        default:
            return state;
    }
}
