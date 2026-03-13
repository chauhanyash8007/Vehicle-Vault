import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "../components/Home/HomePage";
import Login from "../components/Login/Login";
import Signup from "../components/Signup/Signup";

const router = createBrowserRouter([
  { path: "/Home", element: <HomePage /> },
  { path: "/Login", element: <Login /> },
  { path: "/Signup", element: <Signup /> },
]);

const AppRouter = () => {
  return <RouterProvider router={router}></RouterProvider>;
};

export default AppRouter;
