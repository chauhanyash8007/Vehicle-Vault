import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name) newErrors.name = "Name required";

    if (!form.email) newErrors.email = "Email required";

    if (form.password.length < 6)
      newErrors.password = "Password must be 6 characters";

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {

      // redirect to Home
      navigate("/Home");

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
          />
          {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
          />
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm">
              {errors.confirmPassword}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg"
          >
            Sign Up
          </button>

          <p className="text-center text-white/70 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400">
              Login
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Signup;