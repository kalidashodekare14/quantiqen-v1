import { cn } from "@/lib/utils";

interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  return (
    <p className={cn("text-destructive text-sm", className)}>
      {message}
    </p>
  );
}
