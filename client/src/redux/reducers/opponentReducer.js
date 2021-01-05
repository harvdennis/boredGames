import { SET_OPPONENT } from '../types'; //types used are imported

const initialState = {
    opponent: {},
}; //the values for the intitial state

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_OPPONENT:
            return {
                ...state,
                ...action.payload,
            }; //sets the users opponents
        default:
            return state;
    }
}
