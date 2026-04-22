import { AppError } from "@/utils/error/errors";
import { generateJwt } from "@/utils/jwt";
import { prisma } from "@/utils/prisma";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendForgetPasswordOTPEmail, sendOTPEmail, sendPasswordResetConfirmationEmail, sendWelcomeEmail } from "@/utils/email/email";

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getProviderErrorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return "Unable to send OTP email right now. Please try again.";
  }

  const maybeAxiosError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return (
    maybeAxiosError.response?.data?.message
    || maybeAxiosError.message
    || "Unable to send OTP email right now. Please try again."
  );
}

async function sendOTPOrThrow(email: string, otp: string): Promise<void> {
  try {
    await sendOTPEmail(email, otp);
  } catch (error) {
    const providerMessage = getProviderErrorMessage(error);
    throw new AppError(providerMessage, 502);
  }
}

export async function loginService(email: string, password: string): Promise<{ user: User, token: string }> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("Invalid email or password", 400);
  }

  const isHashedPassword = /^\$2[aby]\$/.test(user.password);
  const passwordMatches = isHashedPassword
    ? await bcrypt.compare(password, user.password)
    : user.password === password;

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 400);
  }

  if (!isHashedPassword) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }

  if (!user.emailVerified) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  if (!user.isActive) {
    throw new AppError("Account is deactivated", 403);
  }

  const token = generateJwt({ id: user.id, email: user.email, role: user.role });
  const cleanUser = { ...user, password: "TryMeAndFail" };

  return { user: cleanUser, token };
}

export async function sendSignupOTPService(
  name: string,
  email: string,
  password: string,
  goal?: string,
  currentStatus?: string
): Promise<{ message: string }> {
  // Check if a fully-registered user already exists.
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser?.emailVerified) {
    throw new AppError("Email already registered", 400);
  }

  // Generate OTP for this signup attempt.
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingUser && !existingUser.emailVerified) {
    // Legacy compatibility path for rows that were created before OTP verification.
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        password: hashedPassword,
        role: "STUDENT",
        goal: goal || null,
        currentStatus: currentStatus || null,
        emailVerified: false,
        otp,
        otpExpiry,
      }
    });

    // Clear any pending signup row for this email if it exists.
    await prisma.pendingSignup.deleteMany({ where: { email } });
  } else {
    // New flow: keep unverified signup data out of User table.
    await prisma.pendingSignup.upsert({
      where: { email },
      create: {
        name,
        email,
        password: hashedPassword,
        goal: goal || null,
        currentStatus: currentStatus || null,
        otp,
        otpExpiry,
      },
      update: {
        name,
        password: hashedPassword,
        goal: goal || null,
        currentStatus: currentStatus || null,
        otp,
        otpExpiry,
      },
    });
  }

  // Send OTP email.
  await sendOTPOrThrow(email, otp);

  return { message: "OTP sent to your email" };
}

export async function verifyOTPService(email: string, otp: string): Promise<{ user: User, token: string }> {
  const pendingSignup = await prisma.pendingSignup.findUnique({
    where: { email }
  });

  if (pendingSignup) {
    if (pendingSignup.otp !== otp) {
      throw new AppError("Invalid OTP", 400);
    }

    if (pendingSignup.otpExpiry < new Date()) {
      throw new AppError("OTP has expired. Please request a new one", 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser?.emailVerified) {
      await prisma.pendingSignup.deleteMany({ where: { email } });
      throw new AppError("Email already verified", 400);
    }

    const verifiedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email },
        update: {
          name: pendingSignup.name,
          password: pendingSignup.password,
          role: "STUDENT",
          goal: pendingSignup.goal,
          currentStatus: pendingSignup.currentStatus,
          emailVerified: true,
          otp: null,
          otpExpiry: null,
          isActive: true,
        },
        create: {
          name: pendingSignup.name,
          email,
          password: pendingSignup.password,
          role: "STUDENT",
          goal: pendingSignup.goal,
          currentStatus: pendingSignup.currentStatus,
          emailVerified: true,
          isActive: true,
        },
      });

      await tx.pendingSignup.delete({ where: { email } });
      return user;
    });

    try {
      await sendWelcomeEmail(email, verifiedUser.name);
    } catch (error) {
      console.error("[Welcome email send failed after verification]", error);
    }

    const token = generateJwt({ id: verifiedUser.id, email: verifiedUser.email, role: verifiedUser.role });
    const cleanUser = { ...verifiedUser, password: "TryMeAndFail" };

    return { user: cleanUser, token };
  }

  // Legacy compatibility path: rows that were created before OTP verification.
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("Signup session not found. Please sign up again", 404);
  }

  if (user.emailVerified) {
    throw new AppError("Email already verified", 400);
  }

  if (!user.otp || user.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    throw new AppError("OTP has expired. Please request a new one", 400);
  }

  // Verify legacy user and clear OTP.
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      otp: null,
      otpExpiry: null,
      isActive: true,
    }
  });

  // Send welcome email.
  try {
    await sendWelcomeEmail(email, user.name);
  } catch (error) {
    console.error("[Welcome email send failed after verification]", error);
  }

  // Generate token.
  const token = generateJwt({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
  const cleanUser = { ...updatedUser, password: "TryMeAndFail" };

  return { user: cleanUser, token };
}

export async function resendOTPService(email: string): Promise<{ message: string }> {
  const pendingSignup = await prisma.pendingSignup.findUnique({
    where: { email }
  });

  if (pendingSignup) {
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.pendingSignup.update({
      where: { email },
      data: { otp, otpExpiry }
    });

    await sendOTPOrThrow(email, otp);
    return { message: "OTP resent to your email" };
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("Signup session not found. Please sign up again", 404);
  }

  if (user.emailVerified) {
    throw new AppError("Email already verified", 400);
  }

  // Generate new OTP for legacy unverified user records.
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpiry,
    }
  });

  await sendOTPOrThrow(email, otp);

  return { message: "OTP resent to your email" };
}

export async function sendForgetPasswordOTPService(email: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Don't reveal if user exists for security
    return { message: "If an account exists with this email, an OTP has been sent" };
  }

  if (!user.isActive) {
    throw new AppError("Account is deactivated", 403);
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP for password reset
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp,
      otpExpiry,
    }
  });

  // Send OTP email
  try {
    await sendForgetPasswordOTPEmail(email, otp);
  } catch (error) {
    const providerMessage = getProviderErrorMessage(error);
    throw new AppError(providerMessage, 502);
  }

  return { message: "If an account exists with this email, an OTP has been sent" };
}

export async function verifyForgetPasswordOTPService(email: string, otp: string): Promise<{ verified: boolean }> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.otp || user.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    throw new AppError("OTP has expired. Please request a new one", 400);
  }

  // OTP is valid, but don't clear it yet - we'll clear it after password reset
  return { verified: true };
}

export async function resetPasswordService(
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.otp || user.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    throw new AppError("OTP has expired. Please request a new one", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpiry: null,
    }
  });

  // Send confirmation email (best effort)
  try {
    await sendPasswordResetConfirmationEmail(email, user.name);
  } catch (error) {
    console.error("[Password reset confirmation email send failed]", error);
  }

  return { message: "Password reset successfully" };
}