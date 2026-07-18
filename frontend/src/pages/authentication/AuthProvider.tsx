import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getRefreshToken, logInUser, logOutUser } from "./AuthApis";

const DEFAULT_USER = {
  username: "",
  name: "",
};

interface AuthContextType {
  user: {
    username: string;
    name: string;
  };
  isUserLogging: boolean;
  isLoggedIn: boolean;
  logIn: ({
    emailId,
    password,
  }: {
    emailId: string;
    password: string;
  }) => Promise<boolean>;
  logOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogInUser = async ({
    emailId,
    password,
  }: {
    emailId: string;
    password: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      localStorage.removeItem("pending_logout");
      const isSuccess = await logInUser({ emailId, password });
      if (!isSuccess) throw new Error();
      setUser({ username: "testUsername", name: "name" });
      return true;
    } catch {
      setUser(DEFAULT_USER);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogOutUser = async () => {
    try {
      setIsLoading(true);
      localStorage.setItem("pending_logout", "true");
      const isSuccess = await logOutUser();
      if (isSuccess) {
        localStorage.removeItem("pending_logout");
      }
    } finally {
      setUser(DEFAULT_USER);
      setIsLoading(false);
    }
  };

  const refreshToken = useCallback(async () => {
    try {
      if (localStorage.getItem("pending_logout") === "true") throw new Error();
      setIsLoading(true);
      const isSuccess = await getRefreshToken();
      if (!isSuccess) throw new Error();
      setUser({ username: "testUsername", name: "name" });
    } catch {
      setUser(DEFAULT_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (navigator.onLine && localStorage.getItem("pending_logout")) {
      handleLogOutUser();
    } else {
      refreshToken();
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isUserLogging: isLoading,
      isLoggedIn: !!user.username,
      logIn: handleLogInUser,
      logOut: handleLogOutUser,
      refreshToken,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const userContext = useContext(AuthContext);
  if (!userContext) {
    throw new Error("Can not be used outside the context wrapper");
  }
  return userContext;
};

// eslint-disable-next-line react-refresh/only-export-components
export default useAuth;
