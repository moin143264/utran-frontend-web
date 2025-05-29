export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateOTP = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};
