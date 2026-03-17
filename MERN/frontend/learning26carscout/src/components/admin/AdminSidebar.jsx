import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";

export const AdminSidebar = () => {

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <div className={`bg-gray-900 text-white p-5 transition-all duration-300 
        ${isOpen ? "w-64" : "w-16"}`}>

        <button
          className="mb-6 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        <ul className="space-y-4 font-medium">

          <li>
            <Link to="/admin/dashboard" className="block hover:text-blue-400">
              Dashboard
            </Link>
          </li>

          <li>
            <Link to="/admin/users" className="block hover:text-blue-400">
              Users
            </Link>
          </li>

          <li>
            <Link to="/admin/settings" className="block hover:text-blue-400">
              Settings
            </Link>
          </li>
          <li>
            <Link to="/admin/createproduct" className="block hover:text-blue-400">
              createproduct
            </Link>
          </li>

          <li>
            <button className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
              Logout
            </button>
          </li>

        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 bg-gray-100">
        <Outlet/>
      </div>

    </div>
  );
};