import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthChecklistProps {
  password: string;
}

const criteria = [
  { label: "At least 12 characters", test: (p: string) => p.length >= 12 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "Contains special character",
    test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
  },
];

export function PasswordStrengthChecklist({ password }: PasswordStrengthChecklistProps) {
  return (
    <ul className="flex flex-col gap-1">
      {criteria.map((c) => {
        const met = c.test(password);
        return (
          <li
            key={c.label}
            className={cn(
              "flex items-center gap-1.5 text-xs",
              met ? "text-chart-2" : "text-muted-foreground",
            )}
          >
            {met ? <Check className="size-3" /> : <X className="size-3" />}
            {c.label}
          </li>
        );
      })}
    </ul>
  );
}
