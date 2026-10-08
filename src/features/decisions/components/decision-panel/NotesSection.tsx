"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/hooks/use-role";
import { formatDateTime, formatRelativeTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import { useCreateDecisionNote, useDecisionNotes, useUpdateDecisionNote } from "../../hooks/useDecisions";

interface NotesSectionProps {
  decisionId: string;
}

const NotesSection = ({ decisionId }: NotesSectionProps) => {
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  const { user } = useAuth();
  const { hasAnyRole } = useRole();
  const canWrite = hasAnyRole(["CUSTOMER_ADMIN", "ANALYST"]);

  const { data: notes, isLoading } = useDecisionNotes(decisionId);
  const createNote = useCreateDecisionNote();
  const updateNote = useUpdateDecisionNote();

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const handleCreate = () => {
    if (!body.trim()) return;
    createNote.mutate(
      { id: decisionId, body: body.trim() },
      {
        onSuccess: () => {
          toast.success("Note added.");
          setBody("");
        },
        onError: handleError,
      },
    );
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editBody.trim()) return;
    updateNote.mutate(
      { id: decisionId, noteId, body: editBody.trim() },
      {
        onSuccess: () => {
          toast.success("Note updated.");
          setEditingId(null);
        },
        onError: handleError,
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading notes…</p>
      ) : !notes || notes.length === 0 ? (
        <p className="text-muted-foreground text-sm">No investigation notes yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => {
            const isAuthor = note.authorUserId === user?.user_id;
            const isEditing = editingId === note.id;

            return (
              <div key={note.id} className="bg-muted/50 rounded-lg p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-muted-foreground font-mono text-xs">
                    {note.authorUserId}
                  </span>
                  <span className="text-muted-foreground text-xs" title={formatDateTime(note.createdAt)}>
                    {formatRelativeTime(note.createdAt)}
                  </span>
                </div>

                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={3}
                      maxLength={10000}
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={!editBody.trim() || updateNote.isPending}
                        onClick={() => handleSaveEdit(note.id)}
                      >
                        {updateNote.isPending ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-card-foreground text-sm whitespace-pre-wrap">{note.body}</p>
                    {isAuthor && canWrite && (
                      <button
                        type="button"
                        className="text-primary mt-1.5 text-xs hover:underline"
                        onClick={() => {
                          setEditingId(note.id);
                          setEditBody(note.body);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canWrite ? (
        <div className="flex flex-col gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add an investigation note… (max 10000 characters)"
            maxLength={10000}
            rows={3}
          />
          <div className="flex justify-end">
            <Button size="sm" disabled={!body.trim() || createNote.isPending} onClick={handleCreate}>
              {createNote.isPending ? "Adding…" : "Add note"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          Your role cannot add notes (analyst or admin required).
        </p>
      )}
    </div>
  );
};

export default NotesSection;
