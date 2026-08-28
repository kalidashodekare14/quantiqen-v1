"use client";

import { useState } from "react";
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
import { UserPlus, Copy, Check, CopyCheck } from "lucide-react";
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
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
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

  const handleClose = () => {
    setOpen(false);
    setCreatedUser(null);
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
                The temporary password expires on{" "}
                {new Date(createdUser.temporaryPasswordExpiresAt).toLocaleString()}.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border bg-muted/50 p-4 font-mono text-sm">
              <div className="mb-3 grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">User ID</span>
                  <span className="bg-background flex items-center gap-2 rounded border px-2 py-0.5 font-semibold">
                    {createdUser.user.userId}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(createdUser.user.userId);
                        setCopiedUserId(true);
                        setTimeout(() => setCopiedUserId(false), 2000);
                      }}
                      className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                      title="Copy User ID"
                    >
                      {copiedUserId ? (
                        <Check className="size-3.5 text-green-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Temporary Password</span>
                  <span className="bg-background flex items-center gap-2 rounded border px-2 py-0.5 font-semibold tracking-wide">
                    {createdUser.temporaryPassword}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(createdUser.temporaryPassword);
                        setCopiedPassword(true);
                        setTimeout(() => setCopiedPassword(false), 2000);
                      }}
                      className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                      title="Copy password"
                    >
                      {copiedPassword ? (
                        <Check className="size-3.5 text-green-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Please share these credentials with the user through a secure channel (phone, in person, etc.).
              </p>
            </div>
            <DialogFooter className="flex flex-row items-center justify-between sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `User ID: ${createdUser.user.userId}\nTemporary Password: ${createdUser.temporaryPassword}`;
                  navigator.clipboard.writeText(text);
                  setCopiedAll(true);
                  setTimeout(() => setCopiedAll(false), 2000);
                }}
              >
                {copiedAll ? (
                  <>
                    <CopyCheck className="mr-1.5 size-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 size-3.5" />
                    Copy All
                  </>
                )}
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
              <DialogDescription>
                Create a new user in your organization. A temporary password will be generated.
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
