import {RSAA} from 'redux-api-middleware';
import Config from 'react-native-config';
import {loginValidator, phoneNumberValidator} from '../validators/login';

export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR';

export const USER_REGISTRATION_REQUEST = 'USER_REGISTRATION_REQUEST';
export const USER_REGISTRATION_SUCCESS = 'USER_REGISTRATION_SUCCESS';
export const USER_REGISTRATION_ERROR = 'USER_REGISTRATION_ERROR';

export const USER_LOGOUT_REQUEST = 'USER_LOGOUT_REQUEST';
export const USER_LOGOUT_SUCCESS = 'USER_LOGOUT_SUCCESS';
export const USER_LOGOUT_ERROR = 'USER_LOGOUT_ERROR';


export const doLogin = (payload) => (dispatch) => {
  const errors = loginValidator(payload);
  if (errors && errors.length) {
    return dispatch({
      type: USER_LOGIN_ERROR,
      errors,
    });
  }

  const {loginid, password} = payload;
  const device = getDeviceInfo();

  const body = JSON.stringify({
    email: loginid,
    password,
    device,
  });

  return dispatch({
    [RSAA]: {
      endpoint: `${Config.API_URL}user/login`,
      method: 'POST',
      body,
      headers: {'Content-Type': 'application/json'},
      types: [
        USER_LOGIN_REQUEST,
        {
          type: USER_LOGIN_SUCCESS,
          meta: {request: payload},
        },
        USER_LOGIN_ERROR,
      ],
    },
  });
};

export const doSendOTP = (payload) => (dispatch) => {
  const errors = phoneNumberValidator(payload);
  if (errors && errors.length) {
    return dispatch({
      type: USER_LOGIN_ERROR,
      errors,
    });
  }

  const {loginid, password} = payload;

  const body = JSON.stringify({
    email: loginid,
    password,
    device,
  });

  return dispatch({
    [RSAA]: {
      endpoint: `${Config.API_URL}user/login`,
      method: 'POST',
      body,
      headers: {'Content-Type': 'application/json'},
      types: [
        USER_LOGIN_REQUEST,
        {
          type: USER_LOGIN_SUCCESS,
          meta: {request: payload},
        },
        USER_LOGIN_ERROR,
      ],
    },
  });
};