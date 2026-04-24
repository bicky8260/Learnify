import { useMutation } from "@tanstack/react-query";
import type { LoginRequestParams } from "../../types/zod";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
import { useEffect, useState } from "react";
import {
  Eye,
  EyeClosed,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import type { Response, UserRole } from "../../types";
import { userStore } from "../../state/global";
import { useNavigate, Link } from "react-router-dom";
import { getDefaultRouteForRole } from "../../routes";

interface LoginResponse extends Response {
  data: {
    user: {
      password: string;
      name: string;
      id: string;
      email: string;
      role: UserRole;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string | null;
      updatedBy: string | null;
    };
    token: string;
  };
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const setToken = userStore((state) => state.setToken);
  const setUser = userStore((state) => state.setUser);
  const getToken = userStore((state) => state.token);
  const getUser = userStore((state) => state.user);
  const navigate = useNavigate();

  const meMutation = useMutation({
    mutationFn: async () => {
      const res = await api.get(API_ROUTES.AUTH.ME);
      return res.data;
    },
    onSuccess: () => {
      const role = getUser?.role;
      // Use the helper function
      const defaultRoute = getDefaultRouteForRole(role);
      navigate(defaultRoute);
    },
  });

  useEffect(() => {
    if (getToken) {
      meMutation.mutate();
    }
  }, [getUser, getToken]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequestParams) => {
      const res = await api.post(API_ROUTES.AUTH.LOGIN, data);
      return res.data;
    },
    onSuccess: (data: LoginResponse) => {
      setToken(data.data.token);
      setUser(data.data.user);

      // Use the helper function for role-based redirect
      const defaultRoute = getDefaultRouteForRole(data.data.user.role);
      navigate(defaultRoute);
    },
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div
      className="min-h-screen theme-page-shell animate-page-in flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <div className="pointer-events-none absolute -top-12 right-0 w-72 h-72 rounded-full bg-[var(--primary)]/20 blur-3xl animate-float-soft" />
      <div className="pointer-events-none absolute -bottom-10 left-0 w-72 h-72 rounded-full bg-[var(--accent)]/75 blur-3xl animate-float-soft" />

      <div className="w-full max-w-md mx-auto">
        <div className="w-full theme-card rounded-[calc(var(--radius)+16px)] shadow-xl overflow-hidden border border-[var(--border)]/70">
          <div className="p-6 sm:p-8 md:p-9">
            <div className="text-center mb-8">
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Welcome back
              </h1>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Sign in to continue learning
              </p>
            </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail
                        size={20}
                        style={{ color: "var(--muted-foreground)" }}
                      />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      placeholder="you@example.com"
                      style={
                        {
                          backgroundColor: "var(--input)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                          "--tw-ring-color": "var(--primary)",
                        } as any
                      }
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      Password
                    </label>
                    <Link
                      to="/forget-password"
                      className="text-sm font-medium"
                      style={{ color: "var(--primary)" }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock
                        size={20}
                        style={{ color: "var(--muted-foreground)" }}
                      />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                      style={
                        {
                          backgroundColor: "var(--input)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                          "--tw-ring-color": "var(--primary)",
                        } as any
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye
                          size={20}
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      ) : (
                        <EyeClosed
                          size={20}
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full theme-btn py-3 px-4 rounded-[calc(var(--radius)+8px)] font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {loginMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Error Message */}
              {loginMutation.isError && (
                <div
                  className="mt-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: "var(--destructive)",
                    color: "var(--destructive-foreground)",
                  }}
                >
                  <p className="text-sm">
                    {(() => {
                      const err = loginMutation.error as any;
                      if (err?.response?.status === 404) {
                        return "Account not found. Please sign up first to continue.";
                      }
                      if (err?.response?.status === 401 || err?.response?.status === 403) {
                        return "Invalid email or password. Please try again.";
                      }
                      if (err?.response?.data?.message) {
                        return String(err.response.data.message);
                      }
                      return err instanceof Error
                        ? err.message
                        : "Login failed. Please try again.";
                    })()}
                  </p>
                </div>
              )}

            {/* Sign Up Link */}
            <div
              className="mt-8 text-center"
              style={{ color: "var(--muted-foreground)" }}
            >
              <p className="text-sm">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium"
                  style={{ color: "var(--primary)" }}
                >
                  Sign up
                </Link>
              </p>
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <ArrowLeft size={16} />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="py-4 px-6"
            style={{
              backgroundColor: "var(--muted)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <p
              className="text-xs text-center"
              style={{ color: "var(--muted-foreground)" }}
            >
              By signing in, you agree to our{" "}
              <a href="#" className="underline hover:opacity-70">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:opacity-70">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
