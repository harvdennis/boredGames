import { SET_FRIEND, SEARCH_FRIEND, SET_FRIENDS, IS_FRIEND, NOT_FRIEND, APPEND_FRIEND, UPDATE_STATUS } from '../types';

const initialState = {
    friendList: [],
    friendData: {},
    searchedFriend: {},
    isFriend: false,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_FRIEND:
            return {
                ...state,
                isFriend: false,
            };
        case SET_FRIENDS:
            return {
                ...state,
                ...action.payload,
            };
        case SEARCH_FRIEND:
            return {
                ...state,
                ...action.payload,
            };
        case IS_FRIEND:
            return {
                ...state,
                isFriend: false,
            };
        case NOT_FRIEND:
            return {
                ...state,
                isFriend: true,
            };
        case APPEND_FRIEND:
            return {
                ...state,
                friendData: { ...state.friendData, [action.payload.userId]: { ...action.payload } },
            };

        default:
            return state;
    }
}
