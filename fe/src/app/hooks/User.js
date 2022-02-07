import React, { useState } from "react";
import { useDispatch } from "react-redux";
import i18n from "../../i18n";
import { changePasswordAction } from "../reducers/user/currentUserReducer";

export function useChangePassword() {
  const dispatch = useDispatch();
  const [passwordFormData, setPasswordFormData] = useState({});
  const [error, setError] = useState(null);

  const handleInputChange = (prop, val) => {
    setError(null);
    setPasswordFormData({ ...passwordFormData, [prop]: val });
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();

    if (!passwordFormData.password || !passwordFormData.passwordAgain) {
      setError(i18n.t("Passwords do not match"));
    } else if (passwordFormData.password !== passwordFormData.passwordAgain) {
      setError(i18n.t("Passwords do not match"));
    } else {
      dispatch(changePasswordAction(passwordFormData));
      setPasswordFormData({});
    }
  };

  return { passwordFormData, error, handleInputChange, handleSubmitPassword };
}
