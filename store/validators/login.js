export const loginValidator = payload => {
  const errors = [];
  if (payload.phone.length < 1) {
    errors.push('Phone number cannot be empty');
  }

  return errors.length ? errors : false;
};

export const phoneNumberValidator = payload => {
  const errors = [];
  if (payload.phone_number.length < 1) {
    errors.push('Phone number cannot be empty');
  }

  return errors.length ? errors : false;
};
