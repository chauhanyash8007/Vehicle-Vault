// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import AppRouter from "./router/AppRouter";
import { ToastContainer, Zoom } from 'react-toastify'
import axios from 'axios'

axios.defaults.baseURL = "http://localhost:3000"

function App() {
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
