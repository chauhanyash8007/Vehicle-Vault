import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {

  //all hooks will be declare at component level..
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const submitHandler = async(data) => {

    //{email:"",password:""}
    try{
      const res = await axios.post("https://node5.onrender.com/user/login",data)
      console.log("response...",res); //axios object
      console.log("response data...",res.data); //actual data
      if(res.status==200){
        //alert("login success")
        toast.success("login success")
        //check role in api response..
        navigate("/user")
      }
  }catch(err){
      console.log("error...",err);
      //alert("login failed")
      toast.error("Login failed..")
  }

    
    //console.log("data...",data);
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE IMAGE */}
      <div className="hidden md:flex w-1/2 h-screen">
        <img
          src="https://images.unsplash.com/photo-1557804506-669a67965ba0"
          alt="office"
          className="object-cover w-full h-full"
        />
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex items-center justify-center w-full md:w-1/2 px-6">
        <div className="w-full max-w-md">

          <h2 className="text-3xl font-bold mb-2">Welcome Back 👋</h2>
          <p className="text-gray-500 mb-6">Please login to continue</p>

           <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">

            {/* EMAIL */}
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                {...register("email", {
                  required: "Email is required"
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Minimum 6 characters"
                  }
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
            >
              Login
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}