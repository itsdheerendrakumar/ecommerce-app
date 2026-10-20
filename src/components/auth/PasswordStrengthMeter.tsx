"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { evaluatePasswordStrength } from "@/lib/validations/auth";

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password);

  const requirements = [
    { label: "8+ characters", met: strength.checks.length },
    { label: "Upper & lowercase", met: strength.checks.hasUppercase && strength.checks.hasLowercase },
    { label: "At least 1 number", met: strength.checks.hasNumber },
    { label: "Special symbol (!@#$)", met: strength.checks.hasSpecial },
  ];

  return (
    <div className="space-y-2 pt-1 text-xs">
      {/* Strength Bar */}
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>Password Strength:</span>
        <span
          className={`font-semibold ${
            strength.score <= 1
              ? "text-red-500"
              : strength.score === 2
              ? "text-amber-500"
              : strength.score === 3
              ? "text-emerald-500"
              : "text-primary"
          }`}
        >
          {strength.label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              step <= strength.score ? strength.color : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {requirements.map((req, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
              req.met ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground/80"
            }`}
          >
            <div
              className={`size-3.5 rounded-full flex items-center justify-center shrink-0 ${
                req.met
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground/60"
              }`}
            >
              {req.met ? <Check className="size-2.5 stroke-[3]" /> : <X className="size-2.5" />}
            </div>
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
