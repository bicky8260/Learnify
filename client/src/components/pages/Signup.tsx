import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import type {
  VerifyOTPRequestParams,
} from "../../types/zod";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
import { useState } from "react";
import {
  Eye,
  EyeClosed,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Target,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import type { Response } from "../../types";
import { userStore } from "../../state/global";
import { useNavigate, useLocation, Link } from "react-router-dom";

interface SignupResponse extends Response {
  data: {
    message: string;
  };
}

interface ResendOTPResponse extends Response {
  data: {
    message: string;
  };
}

interface VerifyOTPResponse extends Response {
  data: {
    user: any;
    token: string;
  };
}

type ApiErrorShape = {
  message?: string;
  errors?: Array<{ message?: string }>;
};

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    if (error.response?.status === 404) {
      return "Account services are currently offline. Please try again later.";
    }
    if (error.response?.status === 409) {
      return "An account with this email already exists.";
    }
    if (error.response?.status === 500) {
      return "Internal server error. Database might not be connected.";
    }
    const responseData = error.response?.data;
    const responseMessage = responseData?.message?.trim();
    if (responseMessage) {
      return responseMessage;
    }

    const firstValidationMessage = responseData?.errors?.[0]?.message?.trim();
    if (firstValidationMessage) {
      return firstValidationMessage;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

const goals = [
  "Career Change",
  "Skill Enhancement",
  "Certification",
  "Personal Interest",
  "Job Promotion",
  "Entrepreneurship",
];

const currentStatuses = [
  "Student",
  "Professional",
  "Unemployed",
  "Entrepreneur",
  "Freelancer",
  "Other",
];

export default function Signup() {
  // ✅ Change to 3 steps
  const [step, setStep] = useState<"basic" | "verify" | "additional">("basic");
  const [showPassword, setShowPassword] = useState(false);
  const [basicFormData, setBasicFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [emailForOTP, setEmailForOTP] = useState("");
  const [otpInfoMessage, setOtpInfoMessage] = useState<string | null>(null);
  const [additionalFormData, setAdditionalFormData] = useState({
    goal: "",
    currentStatus: "",
  });

  const setToken = userStore((state) => state.setToken);
  const setUser = userStore((state) => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Step 1: Send signup (basic info only)
  const signupMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
    }) => {
      const res = await api.post<SignupResponse>(API_ROUTES.AUTH.SIGNUP, {
        ...data,
        goal: "",
        currentStatus: "",
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      setOtpInfoMessage(data.data.message || "Verification code sent successfully.");

      setEmailForOTP(variables.email);
      setStep("verify");
    },
  });

  // ✅ Step 2: Verify OTP
  const verifyOTPMutation = useMutation({
    mutationFn: async (data: VerifyOTPRequestParams) => {
      const res = await api.post<VerifyOTPResponse>(
        API_ROUTES.AUTH.VERIFY_OTP,
        data
      );
      return res.data;
    },
    onSuccess: (data) => {
      // Store token and user temporarily, but don't navigate yet
      setToken(data.data.token);
      setUser(data.data.user);
      setStep("additional");
    },
  });

  // ✅ Step 3: Update user with additional info
  const completeSignupMutation = useMutation({
    mutationFn: async () => {
      // Update user profile with goal and status
      // You'll need to create this endpoint or use existing user update endpoint
      const res = await api.put(API_ROUTES.USER.UPDATE_PROFILE, {
        goal: additionalFormData.goal || null,
        currentStatus: additionalFormData.currentStatus || null,
      });
      return res.data;
    },
    onSuccess: () => {
      const currentUser = userStore.getState().user;
      if (currentUser) {
        setUser({ ...currentUser, currentStatus: additionalFormData.currentStatus } as any);
      }
      const redirect = location.state?.redirect || "/dashboard";
      navigate(redirect);
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<ResendOTPResponse>(API_ROUTES.AUTH.RESEND_OTP, {
        email: emailForOTP,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setOtpInfoMessage(data.data.message || "OTP resent to your email.");
    },
  });

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdditionalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdditionalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // ✅ Step 1: Handle basic info submit
  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (basicFormData.password !== basicFormData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setOtpInfoMessage(null);

    const { confirmPassword, ...signupData } = basicFormData;
    signupMutation.mutate(signupData);
  };

  // ✅ Step 2: Handle OTP verify
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      alert("Please enter complete OTP");
      return;
    }
    verifyOTPMutation.mutate({ email: emailForOTP, otp: otpString });
  };

  // ✅ Step 3: Handle complete signup
  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeSignupMutation.mutate();
  };

  const goToPreviousStep = () => {
    if (step === "verify") {
      setStep("basic");
      setOtp(["", "", "", "", "", ""]);
      setOtpInfoMessage(null);
    } else if (step === "additional") {
      setStep("verify");
      setOtp(["", "", "", "", "", ""]);
    }
  };

  return (
    <div
      className="min-h-screen theme-page-shell animate-page-in flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <div className="pointer-events-none absolute -top-12 right-0 w-72 h-72 rounded-full bg-[var(--primary)]/20 blur-3xl animate-float-soft" />
      <div className="pointer-events-none absolute -bottom-10 left-0 w-72 h-72 rounded-full bg-[var(--accent)]/75 blur-3xl animate-float-soft" />

      <div className="w-full max-w-lg">
        <div className="w-full theme-card rounded-[calc(var(--radius)+16px)] shadow-xl overflow-hidden border border-[var(--border)]/70">
          <div className="p-6 sm:p-8 md:p-9">

              {/* STEP 1: Basic Info */}
              {step === "basic" && (
                <>
                  <div className="text-center mb-8">
                    <h1
                      className="text-3xl font-bold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Create your account
                    </h1>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                      Start your learning journey
                    </p>
                  </div>

                  <form onSubmit={handleBasicSubmit} className="space-y-5 sm:space-y-6">
                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User
                            size={20}
                            style={{ color: "var(--muted-foreground)" }}
                          />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={basicFormData.name}
                          onChange={handleBasicChange}
                          className="block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                          placeholder="John Doe"
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
                          value={basicFormData.email}
                          onChange={handleBasicChange}
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
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Password
                      </label>
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
                          value={basicFormData.password}
                          onChange={handleBasicChange}
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

                    {/* Confirm Password Field */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock
                            size={20}
                            style={{ color: "var(--muted-foreground)" }}
                          />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          required
                          value={basicFormData.confirmPassword}
                          onChange={handleBasicChange}
                          className="block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
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
                      </div>
                    </div>

                    {/* Next Button */}
                    <button
                      type="submit"
                      disabled={signupMutation.isPending}
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {signupMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>

                  {signupMutation.isError && (
                    <div
                      className="mt-4 p-4 rounded-lg"
                      style={{
                        backgroundColor: "var(--destructive)",
                        color: "var(--destructive-foreground)",
                      }}
                    >
                      <p className="text-sm">
                        {getApiErrorMessage(
                          signupMutation.error,
                          "Signup failed. Please try again."
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2: OTP Verification */}
              {step === "verify" && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={32} style={{ color: "var(--primary)" }} />
                    </div>
                    <h1
                      className="text-3xl font-bold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Verify Your Email
                    </h1>

                    <p style={{ color: "var(--muted-foreground)" }}>
                      We&apos;ve sent a 6-digit code to{" "}
                      <strong>{emailForOTP}</strong>
                    </p>

                    {otpInfoMessage && (
                      <p className="text-xs mt-3" style={{ color: "var(--muted-foreground)" }}>
                        {otpInfoMessage}
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleVerifySubmit} className="space-y-6">
                    <div>
                      <label
                        className="block text-sm font-medium mb-4 text-center"
                        style={{ color: "var(--foreground)" }}
                      >
                        Enter OTP
                      </label>
                      <div className="flex gap-2 justify-center">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOTPChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOTPKeyDown(index, e)}
                            className="w-12 h-14 text-center text-2xl font-bold rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
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
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={verifyOTPMutation.isPending}
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {verifyOTPMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => resendOTPMutation.mutate()}
                        disabled={resendOTPMutation.isPending}
                        className="text-sm font-medium"
                        style={{ color: "var(--primary)" }}
                      >
                        {resendOTPMutation.isPending
                          ? "Sending..."
                          : "Resend OTP"}
                      </button>
                    </div>
                  </form>

                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="mt-4 w-full py-2 text-sm font-medium flex items-center justify-center gap-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>

                  {verifyOTPMutation.isError && (
                    <div
                      className="mt-4 p-4 rounded-lg"
                      style={{
                        backgroundColor: "var(--destructive)",
                        color: "var(--destructive-foreground)",
                      }}
                    >
                      <p className="text-sm">
                        {getApiErrorMessage(
                          verifyOTPMutation.error,
                          "Verification failed. Please try again."
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* STEP 3: Additional Info */}
              {step === "additional" && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target size={32} style={{ color: "var(--primary)" }} />
                    </div>
                    <h1
                      className="text-3xl font-bold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Tell Us About Yourself
                    </h1>
                    <p style={{ color: "var(--muted-foreground)" }}>
                      Help us personalize your learning experience (Optional)
                    </p>
                  </div>

                  <form onSubmit={handleCompleteSubmit} className="space-y-5">
                    {/* Goal Field */}
                    <div>
                      <label
                        htmlFor="goal"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        <Target size={16} className="inline mr-1" />
                        Learning Goal (Optional)
                      </label>
                      <select
                        id="goal"
                        name="goal"
                        value={additionalFormData.goal}
                        onChange={handleAdditionalChange}
                        className="block w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        style={
                          {
                            backgroundColor: "var(--input)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                            "--tw-ring-color": "var(--primary)",
                          } as any
                        }
                      >
                        <option value="">Select your goal</option>
                        {goals.map((goal) => (
                          <option key={goal} value={goal}>
                            {goal}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Current Status Field */}
                    <div>
                      <label
                        htmlFor="currentStatus"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        <Briefcase size={16} className="inline mr-1" />
                        Current Status (Optional)
                      </label>
                      <select
                        id="currentStatus"
                        name="currentStatus"
                        value={additionalFormData.currentStatus}
                        onChange={handleAdditionalChange}
                        className="block w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        style={
                          {
                            backgroundColor: "var(--input)",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                            "--tw-ring-color": "var(--primary)",
                          } as any
                        }
                      >
                        <option value="">Select your status</option>
                        {currentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Complete Button */}
                    <button
                      type="submit"
                      disabled={completeSignupMutation.isPending}
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {completeSignupMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Completing...
                        </>
                      ) : (
                        <>
                          Complete Signup
                          <CheckCircle2 size={18} />
                        </>
                      )}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="mt-4 w-full py-2 text-sm font-medium flex items-center justify-center gap-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>

                  {completeSignupMutation.isError && (
                    <div
                      className="mt-4 p-4 rounded-lg"
                      style={{
                        backgroundColor: "var(--destructive)",
                        color: "var(--destructive-foreground)",
                      }}
                    >
                      <p className="text-sm">
                        {getApiErrorMessage(
                          completeSignupMutation.error,
                          "Failed to complete signup. Please try again."
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Sign In Link - Only show on step 1 */}
              {step === "basic" && (
                <div
                  className="mt-8 text-center"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium"
                      style={{ color: "var(--primary)" }}
                    >
                      Sign in
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
              )}
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
                By signing up, you agree to our{" "}
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
