import {createStore, applyMiddleware} from 'redux';
import {apiMiddleware} from 'redux-api-middleware';
import rootReducer from './reducers/root';
import thunk from 'redux-thunk';
import tokenInjector from './tokenInjector';

export default () => {
    return createStore(
      rootReducer,
      applyMiddleware(tokenInjector, apiMiddleware, thunk),
    );
  };
  