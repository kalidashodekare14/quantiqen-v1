"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUpdatePortalUser } from "../hooks/useUserManagement";
import type { PortalUser, UpdateUserData } from "../types/user-management.types";
import type { CustomerRole } from "@/types/auth.types";

const assignableRoles: Exclude<CustomerRole, "CUSTOMER_ADMIN">[] = [
  "ANALYST",
  "AUDITOR",
  "READ_ONLY",
];

interface EditUserDialogProps {
  user: PortalUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormErrors {
  displayName?: string;
  email?: string;
}

function deriveRole(role: CustomerRole): Exclude<CustomerRole, "CUSTOMER_ADMIN"> {
  return role === "CUSTOMER_ADMIN" ? "ANALYST" : role;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function EditUserForm({
  user,
  onDone,
}: {
  user: PortalUser;
  onDone: () => void;
}) {
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [role, setRole] = useState<Exclude<CustomerRole, "CUSTOMER_ADMIN">>(
    deriveRole(user.role),
  );
  const [status, setStatus] = useState<"ACTIVE" | "SUSPENDED">(user.status);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState<FormErrors>({});
  const updateUser = useUpdatePortalUser();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!displayName.trim()) {
      newErrors.displayName = "Display name is required";
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data: UpdateUserData = {
      displayName: displayName.trim() || null,
      role,
      status,
      email: email.trim(),
      phone,
    };
    try {
      await updateUser.mutateAsync({ userId: user.id, data });
      toast.success("User updated successfully");
      onDone();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update user";
      toast.error(message);
    }
  };

  return (
    <>
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="edit-displayName">
            Display Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="edit-displayName"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              clearError("displayName");
            }}
            placeholder="e.g. Bob Analyst"
            className={errors.displayName ? "border-destructive" : ""}
          />
          {errors.displayName && (
            <p className="text-destructive text-xs">{errors.displayName}</p>
          )}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Role</label>
          <Select value={role} onValueChange={(v) => setRole(v as Exclude<CustomerRole, "CUSTOMER_ADMIN">)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assignableRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={(v) => setStatus(v as "ACTIVE" | "SUSPENDED")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="edit-email">
            Email <span className="text-destructive">*</span>
          </label>
          <Input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email}</p>
          )}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="edit-phone">
            Phone
          </label>
          <Input
            id="edit-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={updateUser.isPending}>
          {updateUser.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const dialogKey = useMemo(() => user?.id ?? "none", [user?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update role, status, or contact info for {user?.userId}.
          </DialogDescription>
        </DialogHeader>
        {user && (
          <EditUserForm key={dialogKey} user={user} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
