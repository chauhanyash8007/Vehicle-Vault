// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import AppRouter from "./router/AppRouter";
import { ToastContainer, Zoom } from "react-toastify";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <AppRouter />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Zoom}
      />
    </>
  );
}

export default App;
