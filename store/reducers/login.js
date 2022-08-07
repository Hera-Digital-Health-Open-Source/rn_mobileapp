import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_ERROR,
  USER_REGISTRATION_REQUEST,
  USER_REGISTRATION_SUCCESS,
  USER_REGISTRATION_ERROR
} from '../actions/login';
import {getActionError} from '../../utils/helpers';
import {saveString, remove} from '../../utils/storage';

const initialState = {
  loginid: '',
  password: '',
  error: '',
  registrationError: '',
  success: false,
  loading: false,
  token: '',
  prefill: {},
  preferences: {}
};

export default (state = initialState, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
    case USER_REGISTRATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: '',
        success: false,
      };
    case USER_LOGIN_SUCCESS:
    case USER_REGISTRATION_SUCCESS:
      // loginid is saved as email in the request object before api call
      if (action.payload.token) {
        // saveString('loginid', action.meta.request.email);
        // saveString('password', action.meta.request.password);
        // saveString('token', action.payload.token);

        return {
          ...state,
          loginid: action.payload.email,
          token: action.payload.token,
          error: '',
          success: true,
          loading: false
        };
      }
      const field =
        action.type === USER_REGISTRATION_SUCCESS
          ? 'registrationError'
          : 'error';
      const defaultError =
        action.type === USER_REGISTRATION_SUCCESS
          ? 'Registration Failed'
          : 'Login Failed';
      return {
        ...state,
        [field]: getActionError(action, defaultError),
        loading: false,
        success: false,
      };
    case USER_LOGIN_ERROR:
      remove('loginid');
      remove('password');
      return {
        ...state,
        error: getActionError(action, 'Login Failed'),
        loading: false,
        success: false,
      };
    default:
      return state;
  }
};
