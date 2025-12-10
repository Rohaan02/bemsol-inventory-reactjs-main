import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import * as Form from "@radix-ui/react-form";
import { Flex, Box, Text } from "@radix-ui/themes";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import { useAuth } from "../../contexts/AuthContext"; // ✅ using context

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error, clearError } = useAuth();

  // 🚀 Auto redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(credentials);
    if (result.success) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <Flex align="center" justify="center" className="min-h-screen bg-gray-50 p-6">
      <Box className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo + Heading */}
        <Flex direction="column" gap="6" align="center">
          <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <Text size="6" weight="bold" className="text-green-600">
            Bemsol Inventory
          </Text>
          <Text size="3" className="text-gray-600">
            Sign in to your account
          </Text>
        </Flex>

        {/* Form */}
        <Form.Root className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <Form.Field name="email" className="space-y-2">
            <Form.Label className="text-sm font-medium text-gray-700">
              Email address
            </Form.Label>
            <Form.Control asChild>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </Form.Control>
          </Form.Field>

          {/* Password */}
          <Form.Field name="password" className="space-y-2">
            <Form.Label className="text-sm font-medium text-gray-700">
              Password
            </Form.Label>
            <div className="relative">
              <Form.Control asChild>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none pr-10"
                />
              </Form.Control>
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeClosedIcon className="w-5 h-5" />
                ) : (
                  <EyeOpenIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </Form.Field>

          {/* Submit */}
          <Form.Submit asChild>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </Form.Submit>
        </Form.Root>

        <Text size="2" className="text-gray-500 text-center mt-6">
          © 2024 Bemsol Inventory. All rights reserved.
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
