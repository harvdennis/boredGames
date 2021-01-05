import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import userReducer from './reducers/userReducer';
import uiReducer from './reducers/uiReducer';
import friendReducer from './reducers/friendReducer';
import opponentReducer from './reducers/opponentReducer';
import statsReducer from './reducers/statsReducer'; //reducers are imported

const initialState = {};

const middleware = [thunk];

const reducers = combineReducers({
    user: userReducer,
    friends: friendReducer,
    UI: uiReducer,
    opponent: opponentReducer,
    statistics: statsReducer,
}); //combines all the reducers

const composeEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose; //allows me to use the redux devolper tool

const enhancer = composeEnhancers(applyMiddleware(...middleware));

const store = createStore(reducers, initialState, enhancer); //creates a redux store using the reducers

export default store;
