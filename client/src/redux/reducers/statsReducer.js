import { SET_STATS } from '../types';

const initialState = {
    stats: {},
}; //the values for the intitial state

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_STATS:
            return {
                ...state,
                ...action.payload,
            }; //updates the new stats
        default:
            return state;
    }
}
