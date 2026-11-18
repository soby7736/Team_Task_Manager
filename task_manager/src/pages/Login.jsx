
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

import { login } from "../services/authService";
import { setCredentials } from "../redux/authSlice";
import { loginSchema } from "../schemas/loginSchema";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");

      const user = await login(data.username, data.password);

      dispatch(setCredentials(user));

      const redirectTo = location.state?.from?.pathname || "/dashboard";

      navigate(redirectTo, { replace: true });

    } catch (error) {
      setServerError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Task Management Login
        </h1>

        <div className="mb-4">
          <label className="block mb-2">Username</label>

          <input
            {...register("username")}
            className="w-full border p-3 rounded"
            placeholder="Enter username"
          />

          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2">Password</label>

          <input
            type="password"
            {...register("password")}
            className="w-full border p-3 rounded"
            placeholder="Enter password"
          />

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="text-red-500 mb-3">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
    
  );
}

export default Login;
