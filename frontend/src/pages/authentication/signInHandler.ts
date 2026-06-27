import { useState } from "react";
import { auth, Fetcher } from "../../utils/api/fetcher";

export const useSignInHandler = () => {
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
    const data = (await Fetcher.Post("/api/auth/login", {
      emailId: form.email,
      password: form.password,
    })) as {
      accessToken: string;
    };
    auth.setAccessToken(data.accessToken ?? data);
  };

  return {
    form,
    handleChange,
    handleLogIn,
  };
};
