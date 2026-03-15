import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Signup() {

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const navigate = useNavigate()


  // const submitHandler = async(data) => {
  //   console.log("data..",data);
  //   //axios.post("http://localhost:3000/user/register")
  //   const res = await axios.post("/user/register",data)

  //   console.log("response..",res)
  //   console.log("response.data..",res.data)
  //   console.log("response.data.data..",res.data.data)
  //   console.log("status",res.status)
  //   if(res.status==201){
  //     toast.success("User registered successfully")
  //     navigate("/") // / -->login -->check your routes in AppRouter.jsx
  //   }
  // };

  const submitHandler = async (data) => {
  try {
    const res = await axios.post("/user/register", data)

    if (res.status === 201) {
      toast.success("User registered successfully")
      navigate("/")
    }

  } catch (err) {
    toast.error(err?.response?.data?.message || "Signup failed")
  }
}
  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE IMAGE */}
      <div className="hidden md:flex w-1/2 h-screen">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
          alt="office"
          className="object-cover w-full h-full"
        />
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex items-center justify-center w-full md:w-1/2 px-6">
        <div className="w-full max-w-md">

          <h2 className="text-3xl font-bold mb-2">Create Account 🚀</h2>
          <p className="text-gray-500 mb-6">Signup to get started</p>

          <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">

            {/* NAME */}
            <div>
              <input
                type="text"
                placeholder="First Name"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                {...register("firstName", { required: "First Name is required" })}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            {/* LAST NAME */}
            <div>
              <input
                type="text"
                placeholder="Last Name"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                {...register("lastName", { required: "Last Name is required" })}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
         

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
            >
              Signup
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}