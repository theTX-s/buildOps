import "./App.css";
import useAuth from "./pages/authentication/AuthProvider";
import SignInPage from "./pages/authentication/SignInPage";
import TestComponent from "./pages/authentication/Test/TestComponent";

function App() {
  const userContext = useAuth();
  if (userContext.isUserLogging) {
    return <>Logging the user in...</>;
  }

  return userContext.isLoggedIn ? <TestComponent /> : <SignInPage />;
}

export default App;
