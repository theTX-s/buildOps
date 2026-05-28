import { useMemo, useState } from "react";
import useFetcher from "../../utils/api/useFetcher";

export const useSignInHandler = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const options = useMemo(() => ({}), []);
  const loginParams = useMemo(() => ({ emailId: email, password }),[email,password]);
//   const loginParams = useMemo(
//     () => ({ emailId: "test@test.test", password: "test" }),
//     [],
//   );
  const {
    isLoading: loginLoading,
    data: loginResponse,
    error: loginError,
  } = useFetcher("POST", "/api/auth/login", loginParams, options);
//   const [call, setCall] = useState(1);
//   const options1 = useMemo(() => ({}), [call]);
//   const { isLoading, data, error } = useFetcher(
//     "GET",
//     "/api/auth/test",
//     null,
//     options1,
//   );

//   console.log(isLoading, data, error);

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    loginLoading,
    loginError,
    loginResponse,
  };
};
