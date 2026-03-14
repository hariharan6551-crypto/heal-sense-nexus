import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Lock, User, ShieldCheck, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Simple hash for demo — not cryptographic, but avoids plaintext
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
};

const VALID_USERNAME = "Admin";
const VALID_PASSWORD_HASH = simpleHash("Health2026");
const PHONE_NUMBER = "7845606004";
const MAX_OTP_ATTEMPTS = 3;
const OTP_EXPIRY_MS = 2 * 60 * 1000; // 2 minutes

interface LoginPageProps {
  onAuthenticated: () => void;
}

const LoginPage = ({ onAuthenticated }: LoginPageProps) => {
  const [step, setStep] = useState<"login" | "otp">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store generatedOtp in a ref so the auto-verify callback always sees
  // the latest value even if React hasn't re-rendered yet.
  const generatedOtpRef = useRef(generatedOtp);
  useEffect(() => {
    generatedOtpRef.current = generatedOtp;
  }, [generatedOtp]);

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (expiryRef.current) clearTimeout(expiryRef.current);
    timerRef.current = null;
    expiryRef.current = null;
  };

  useEffect(() => () => clearTimers(), []);

  const generateOtp = useCallback(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    generatedOtpRef.current = code;
    setOtpExpired(false);
    setIsLockedOut(false);
    setOtpAttempts(0);
    setOtp("");
    setOtpError("");
    setTimeLeft(120);

    clearTimers();

    // Countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimers();
          setOtpExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Expiry timeout
    expiryRef.current = setTimeout(() => {
      setOtpExpired(true);
      clearTimers();
    }, OTP_EXPIRY_MS);

    // Simulate sending OTP (show in toast since Twilio not connected)
    toast.info(`OTP sent to ****${PHONE_NUMBER.slice(-4)}`, {
      description: `Your verification code is: ${code}`,
      duration: 15000,
    });

    return code;
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (username !== VALID_USERNAME || simpleHash(password) !== VALID_PASSWORD_HASH) {
      setLoginError("Invalid username or password");
      return;
    }

    generateOtp();
    setStep("otp");
  };

  // FIX: Accept the OTP value as a parameter so we always compare the
  // freshest value from the InputOTP onChange, not stale React state.
  const verifyOtpValue = useCallback((otpValue: string) => {
    if (otpValue.length !== 6) return;

    if (otpExpired) {
      setOtpError("OTP has expired. Please request a new one.");
      return;
    }

    if (isLockedOut) {
      setOtpError("Maximum attempts reached. Please request a new OTP.");
      return;
    }

    // Compare against the ref to avoid stale closure issues
    if (otpValue === generatedOtpRef.current) {
      clearTimers();
      toast.success("Verification successful! Welcome, Admin.");
      onAuthenticated();
    } else {
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);
      setOtp("");

      if (newAttempts >= MAX_OTP_ATTEMPTS) {
        setOtpError("Maximum attempts reached. Please request a new OTP.");
        setIsLockedOut(true);
        clearTimers();
      } else {
        setOtpError(`Incorrect OTP. ${MAX_OTP_ATTEMPTS - newAttempts} attempt(s) remaining.`);
      }
    }
  }, [otpExpired, isLockedOut, otpAttempts, onAuthenticated]);

  // FIX: When the user types the 6th digit, auto-verify immediately using
  // the value from onChange (not from state, which may be stale).
  const handleOtpChange = useCallback((value: string) => {
    setOtp(value);
    if (value.length === 6) {
      // Use a micro-delay so React can flush the setOtp update, then verify
      setTimeout(() => verifyOtpValue(value), 50);
    }
  }, [verifyOtpValue]);

  const handleVerifyOtp = () => {
    verifyOtpValue(otp);
  };

  const handleResendOtp = () => {
    generateOtp();
    toast.info("New OTP sent!");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // FIX: Verify button disabled logic simplified and corrected.
  // Only disabled when OTP is incomplete length, OR when locked out.
  const isVerifyDisabled = otp.length !== 6 || isLockedOut || otpExpired;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border shadow-xl relative z-10">
        {step === "login" ? (
          <>
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                  <Lock className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
              <CardDescription>Sign in to access AI Analytics Dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> Username
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" /> Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                </div>
                {loginError && (
                  <p className="text-sm text-destructive font-medium">{loginError}</p>
                )}
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90">
                  Sign In
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Verify OTP</CardTitle>
              <CardDescription className="flex items-center justify-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                Code sent to ****{PHONE_NUMBER.slice(-4)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center">
                {!otpExpired ? (
                  <p className="text-sm text-muted-foreground">
                    Expires in <span className="font-mono font-semibold text-foreground">{formatTime(timeLeft)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-destructive font-medium">OTP expired</p>
                )}
              </div>

              {otpError && (
                <p className="text-sm text-destructive font-medium text-center">{otpError}</p>
              )}

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyDisabled}
                >
                  Verify & Continue
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResendOtp}
                >
                  Resend OTP
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setStep("login"); setPassword(""); clearTimers(); }}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
