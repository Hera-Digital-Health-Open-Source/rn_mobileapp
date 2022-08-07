import {RSAA} from 'redux-api-middleware';

const tokenInjector = (store) => (next) => (action) => {
  const callApi = action[RSAA];

  if (callApi) {
    callApi.headers = {
      ...callApi.headers,
    };
  }

  const {token} = store.getState().login;

  if (callApi && token) {
    callApi.headers.Authorization = `Token ${token}`;
  }

  return next(action);
};

export default tokenInjector;
