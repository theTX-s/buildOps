import { useState } from "react";
import { useFetcher } from "../../../utils/api";
import useAuth from "../AuthProvider";

export default function TestComponent() {
  const [wasButtonPressed, setWasButtonPressed] = useState(false);

  const { logOut } = useAuth();

  const {
    isSuccess: testResponse,
    isError: testError,
    isFetching: testFetching,
    load: testAuthAPI,
  } = useFetcher("Test", {
    method: "GET",
    url: "/api/Auth/test",
    cache: false,
    enabled: false,
  });
  
  const handleClick = () => {
    setWasButtonPressed(true);
    testAuthAPI();
  };

  const handleLogout = () => {
    logOut();
    // redirect the user to log in screen
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        position: "relative",
        padding: "20px",
      }}
    >
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
        }}
      >
        Logout
      </button>

      {/* Main Content */}
      {!wasButtonPressed && <p>Press button to test API</p>}

      {wasButtonPressed && (
        <p>
          {testFetching
            ? "Loading ..."
            : testError
              ? "Encountered Error"
              : testResponse
                ? "Success"
                : "Unknown Error"}
        </p>
      )}

      <button onClick={handleClick}>Test Button</button>
    </div>
  );
}
