import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import userReducer from './reducers/userReducer';
import uiReducer from './reducers/uiReducer';
import friendReducer from './reducers/friendReducer';
import opponentReducer from './reducers/opponentReducer';
import statsReducer from './reducers/statsReducer';

const initialState = {};

const middleware = [thunk];

const reducers = combineReducers({
    user: userReducer,
    friends: friendReducer,
    UI: uiReducer,
    opponent: opponentReducer,
    statistics: statsReducer,
});

const composeEnhancers =
    typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
              // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
          })
        : compose;

const enhancer = composeEnhancers(
    applyMiddleware(...middleware)
    // other store enhancers if any
);

const store = createStore(reducers, initialState, enhancer);

export default store;
