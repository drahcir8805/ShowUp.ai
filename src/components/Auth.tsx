"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth";

export function Auth({ onAuth }: { onAuth: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await signUp(email, password);
        setError("Check your email to confirm your account!");
      } else {
        await signIn(email, password);
        onAuth();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5dc] flex items-center justify-center px-6">
      <Card className="w-full max-w-md bg-white/80 border-[#d4d4aa]/30">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#4a4a4a] mb-2">
              {isSignUp ? "Create Account" : "Sign In"}
            </h1>
            <p className="text-[#6a6a6a]">
              {isSignUp 
                ? "Start betting on your class attendance" 
                : "Welcome back to your betting dashboard"
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-[#4a4a4a]">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-2 bg-white border-[#d4d4aa]/30"
                required
              />
            </div>

            <div>
              <Label className="text-[#4a4a4a]">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 bg-white border-[#d4d4aa]/30"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
              disabled={loading}
            >
              {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-[var(--accent)] hover:underline text-sm"
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Need an account? Sign up"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
