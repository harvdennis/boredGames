import { SET_FRIEND, SEARCH_FRIEND, SET_FRIENDS, IS_FRIEND, NOT_FRIEND, APPEND_FRIEND } from '../types'; //types used are imported

const initialState = {
    friendList: [],
    friendData: {},
    searchedFriend: {},
    isFriend: false,
}; //the values for the intitial state

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_FRIEND:
            return {
                ...state,
                isFriend: false,
            }; //updates the is friend to false so the add friend button is hidden
        case SET_FRIENDS:
            return {
                ...state,
                ...action.payload,
            }; //loads the users friends list
        case SEARCH_FRIEND:
            return {
                ...state,
                ...action.payload,
            }; //displays a searched user
        case IS_FRIEND:
            return {
                ...state,
                isFriend: false,
            }; //if the searched user is a friend the add friend button is hidden
        case NOT_FRIEND:
            return {
                ...state,
                isFriend: true,
            }; //if the searched user is not a friend the add friend button is shown
        case APPEND_FRIEND:
            return {
                ...state,
                friendData: { ...state.friendData, [action.payload.userId]: { ...action.payload } },
            }; //A new friend that has just been added is appended to the friend list

        default:
            return state;
    }
}
