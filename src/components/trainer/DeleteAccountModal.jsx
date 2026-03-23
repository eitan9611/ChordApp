import React, { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function DeleteAccountModal({ onClose }) {
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await base44.auth.logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-5">
        <h2 className="text-lg font-bold text-foreground">Delete Account</h2>
        <p className="text-sm text-muted-foreground">
          This will permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 accent-destructive"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <span className="text-sm text-foreground">I understand this is permanent and cannot be undone.</span>
        </label>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!confirmed || deleting}
            className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}