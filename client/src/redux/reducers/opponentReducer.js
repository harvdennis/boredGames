import { SET_OPPONENT } from '../types';

const initialState = {
    opponent: {},
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_OPPONENT:
            return {
                ...state,
                ...action.payload,
            };
        default:
            return state;
    }
}
