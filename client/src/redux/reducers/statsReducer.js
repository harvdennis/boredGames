import { SET_STATS, UPDATE_STATS } from '../types';

const initialState = {
    stats: {},
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_STATS:
            return {
                ...state,
                ...action.payload,
            };
        default:
            return state;
    }
}
