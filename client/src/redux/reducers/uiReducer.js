import { SET_ERRORS, CLEAR_ERRORS, LOADING_UI } from '../types'; //types used are imported

const initialState = {
    loading: false,
    errors: null,
}; //the values for the intitial state

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_ERRORS:
            return {
                ...state,
                loading: false,
                errors: action.payload,
            }; //stops the loading and updates the new errors
        case CLEAR_ERRORS:
            return {
                ...state,
                loading: false,
                errors: null,
            }; //stops loading and clears all errors
        case LOADING_UI:
            return {
                ...state,
                loading: true,
            }; //sets loading to true
        default:
            return state;
    }
}
