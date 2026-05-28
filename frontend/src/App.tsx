// import { useMemo, useState } from "react";
import "./App.css";
// import useFetcher from "./utils/api/useFetcher";
import SignInPage from "./pages/authentication/SignInPage";

function App() {
  // const options = useMemo(()=>({}),[]);
  // const loginParams = useMemo(()=>({emailId:"test@test.test",password:"test"}),[]);
  // const {isLoading:loginLoading,data:loginResponse,error:loginError} = useFetcher("POST","/api/auth/login",loginParams,options);
  
  // const [call,setCall] = useState(1);
  // const options1 = useMemo(() => ({}),[call]);

  // const { isLoading, data, error } = useFetcher(
  //   "GET",
  //   "/api/auth/test",
  //   null,
  //   options1,
  // );

  return (
    <>
    <SignInPage />
      {/* {!loginLoading && <h1>{"longin "+loginResponse}</h1>}
      {loginError && <h1>{"login error"+JSON.stringify(loginError)}</h1>}
      <button onClick={()=>setCall(prev => prev + 1)}>Test</button>
      {!error && <h1>{isLoading ? "Hello World" : JSON.stringify(data)}</h1>}
      {error && <h1>{"unexpected error - " + JSON.stringify(error)}</h1>} */}
    </>
  );
}

export default App;
