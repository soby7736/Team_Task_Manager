
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { login } from "../services/authService";
import { setCredentials } from "../redux/authSlice";
import { loginSchema } from "../schemas/loginSchema";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

      // In our demo, Emily (ID 1) is the admin.
      const isAdmin = Number(user.id) === 1;

      // Always redirect based on the new user's role.
      navigate(isAdmin ? "/dashboard" : "/my-tasks", {
        replace: true,
      });
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Task Manager
          </h1>

          <p className="text-slate-500 mt-2">
            Sign in to your workspace
          </p>
        </div>

        <div className="mb-5">
          <label
            htmlFor="username"
            className="block mb-2 text-sm font-medium text-slate-700"
          >
            Username
          </label>

          <input
            id="username"
            {...register("username")}
            className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter username"
          />

          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="mb-5">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
          />

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="text-red-600 text-sm mb-4" role="alert">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default Login;
