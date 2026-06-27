import "./App.css";
import SignInPage from "./pages/authentication/SignInPage";
import TestComponent from "./pages/authentication/Test/TestComponent";

function App() {
  const path = window.location.pathname;
  return <>{path === "/testPage" ? <TestComponent /> : <SignInPage />}</>;
}

export default App;
