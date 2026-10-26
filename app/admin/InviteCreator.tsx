"use client";

import { useActionState, useState } from "react";
import { createInviteAction, type InviteActionState } from "./actions";

const initialState: InviteActionState = {};

export default function InviteCreator() {
  const [state, formAction, pending] = useActionState(createInviteAction, initialState);
  const [copied, setCopied] = useState(false);

  async function copyInvite() {
    if (!state.inviteCode) return;
    try {
      await navigator.clipboard.writeText(state.inviteCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="admin-panel" aria-labelledby="invite-heading">
      <div className="admin-panel-heading">
        <div>
          <p className="admin-eyebrow">INVITATION MANAGEMENT</p>
          <h2 id="invite-heading">Create an invite code</h2>
        </div>
        <span className="admin-panel-icon" aria-hidden="true">↗</span>
      </div>
      <p className="admin-muted">
        Each code can be used once. The database stores only a one-way hash, so copy the code now
        and share it privately with the person you invite.
      </p>

      <form action={formAction} className="invite-create-form">
        <label htmlFor="invite-expiry">Code expires after</label>
        <select id="invite-expiry" name="expires_in_days" defaultValue="7">
          <option value="1">1 day</option>
          <option value="7">7 days</option>
          <option value="30">30 days</option>
        </select>
        <button className="admin-primary-button" type="submit" disabled={pending}>
          {pending ? "CREATING CODE…" : "GENERATE ONE-TIME CODE"}
        </button>
      </form>

      {state.error ? <p className="admin-alert admin-alert-error" role="alert">{state.error}</p> : null}

      {state.inviteCode ? (
        <div className="invite-result" aria-live="polite">
          <p className="admin-eyebrow">NEW INVITATION · COPY IT NOW</p>
          <code className="invite-code">{state.inviteCode}</code>
          <div className="invite-result-footer">
            <span className="admin-muted">Expires: {state.expiresAt}</span>
            <button className="admin-secondary-button" type="button" onClick={copyInvite}>
              {copied ? "COPIED ✓" : "COPY CODE"}
            </button>
          </div>
          <p className="admin-small-note">
            This raw code will not be retrievable after you leave or refresh this page. Generate another if it is lost.
          </p>
        </div>
      ) : null}
    </section>
  );
}
