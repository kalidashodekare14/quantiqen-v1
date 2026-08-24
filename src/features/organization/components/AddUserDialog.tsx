"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useCreatePortalUser } from "../hooks/useUserManagement";
import type { CreateUserData, CreateUserResponse } from "../types/user-management.types";
import type { CustomerRole } from "@/types/auth.types";

const assignableRoles: Exclude<CustomerRole, "CUSTOMER_ADMIN">[] = [
  "ANALYST",
  "AUDITOR",
  "READ_ONLY",
];

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Exclude<CustomerRole, "CUSTOMER_ADMIN">>("ANALYST");
  const [createdUser, setCreatedUser] = useState<CreateUserResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const createUser = useCreatePortalUser();

  const handleSubmit = async () => {
    const data: CreateUserData = {
      role,
      userId,
      displayName,
      email,
      phone: phone || undefined,
    };

    try {
      const result = await createUser.mutateAsync(data);
      setCreatedUser(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create user";
      toast.error(message);
    }
  };

  const handleCopyPassword = async () => {
    if (!createdUser) return;
    try {
      await navigator.clipboard.writeText(createdUser.temporaryPassword);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy password");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedUser(null);
    setCopied(false);
    resetForm();
  };

  const resetForm = () => {
    setUserId("");
    setDisplayName("");
    setEmail("");
    setPhone("");
    setRole("ANALYST");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
        else setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 size-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {createdUser ? (
          <>
            <DialogHeader>
              <DialogTitle>User Created Successfully</DialogTitle>
              <DialogDescription>
                Share the temporary password with the new user. It will not be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <span className="text-sm font-medium">Temporary Password</span>
                <div className="flex items-center gap-2">
                  <code className="bg-muted text-muted-foreground flex-1 truncate rounded-md px-3 py-2 font-mono text-sm">
                    {createdUser.temporaryPassword}
                  </code>
                  <button
                    onClick={handleCopyPassword}
                    type="button"
                    aria-label="Copy temporary password"
                    className="text-muted-foreground hover:bg-muted hover:text-card-foreground flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
                  >
                    {copied ? <Check className="text-chart-2 size-4" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Expires:{" "}
                {new Date(createdUser.temporaryPasswordExpiresAt).toLocaleString()}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
              <DialogDescription>
                Create a new user in your organization. They will receive a temporary password.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="userId">
                  User ID
                </label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. bob"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="displayName">
                  Display Name
                </label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Bob Analyst"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. bob@acme.example"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="phone">
                  Phone (optional)
                </label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +15550002000"
                />
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createUser.isPending}>
                {createUser.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
