// Validation utilities for authentication

export const validateEmail = (
  email: string,
): { valid: boolean; error?: string } => {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { valid: false, error: "Email is required" };
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  return { valid: true };
};

export const validatePassword = (
  password: string,
): {
  valid: boolean;
  error?: string;
  strength: "weak" | "medium" | "strong";
} => {
  if (!password) {
    return { valid: false, error: "Password is required", strength: "weak" };
  }

  if (password.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters",
      strength: "weak",
    };
  }

  // Check password strength
  let strength: "weak" | "medium" | "strong" = "weak";
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score >= 5) {
    strength = "strong";
  } else if (score >= 3) {
    strength = "medium";
  }

  // Minimum requirements: 8 chars
  const hasMinLength = password.length >= 8;

  if (!hasMinLength) {
    return {
      valid: false,
      error: "Password must be at least 8 characters",
      strength,
    };
  }

  return { valid: true, strength };
};

export const getPasswordStrengthColor = (
  strength: "weak" | "medium" | "strong",
): string => {
  switch (strength) {
    case "weak":
      return "#EF4444"; // red
    case "medium":
      return "#F59E0B"; // orange
    case "strong":
      return "#10B981"; // green
  }
};

export const getPasswordStrengthText = (
  strength: "weak" | "medium" | "strong",
): string => {
  switch (strength) {
    case "weak":
      return "Weak";
    case "medium":
      return "Medium";
    case "strong":
      return "Strong";
  }
};
