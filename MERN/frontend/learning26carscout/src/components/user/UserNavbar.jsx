import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";

export const UserNavbar = () => {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-white shadow-md px-6 py-3 sticky top-0 z-50">
        <div className="flex justify-between items-center">

          {/* LOGO */}
          <h1 className="text-xl font-bold text-blue-500">
            MyApp
          </h1>

          {/* DESKTOP MENU */}
          <ul className="hidden md:flex gap-6 items-center font-medium">
            <li>
              <Link to="/user/getapidemo1" className="hover:text-blue-500">
                GET API DEMO 1
              </Link>
            </li>
            <li>
             <Link to="/user/useeffectdemo" className="hover:text-blue-500">
                useeffectdemo
              </Link>
            </li>
            <li>
              <Link to="/user/settings" className="hover:text-blue-500">
                Settings
              </Link>
            </li>
            <li>
              <button className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600">
                Logout
              </button>
            </li>
          </ul>

          {/* HAMBURGER */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            ☰
          </button>

        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <ul className="md:hidden flex flex-col mt-4 gap-3 font-medium">
            <li>
              <Link to="/user/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/user/profile">Profile</Link>
            </li>
            <li>
              <Link to="/user/settings">Settings</Link>
            </li>
            <li>
              <button className="bg-blue-500 text-white px-4 py-1 rounded-lg w-fit">
                Logout
              </button>
            </li>
          </ul>
        )}
      </nav>

      {/* PAGE CONTENT */}
      <div className="p-6 bg-gray-100 min-h-[calc(100vh-64px)]">
        <Outlet/>
      </div>
    </>
  );
};