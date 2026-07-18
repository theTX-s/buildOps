import { useState } from "react";
import useAuth from "./AuthProvider";

export const useSignInHandler = () => {
  const { logIn } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogIn = async () => {
    const isSuccess = await logIn({
      emailId: form.email,
      password: form.password,
    });
    if (isSuccess){
      // redirect user to dashboard
    }
  };

  return {
    form,
    handleChange,
    handleLogIn,
  };
};;
