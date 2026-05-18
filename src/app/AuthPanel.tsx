import { Cloud, LogOut, User } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import type { AuthState } from "../hooks/useAuth";

export function AuthPanel({ auth }: { auth: AuthState }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  if (!auth.configured) {
    return (
      <section className="auth-panel auth-panel--muted">
        <Cloud size={18} />
        <div>
          <h3>Cloud save offline</h3>
          <p>Add Supabase environment variables to enable account sync.</p>
        </div>
      </section>
    );
  }

  if (auth.user) {
    return (
      <section className="auth-panel">
        <User size={18} />
        <div>
          <h3>Cloud save</h3>
          <p>{auth.user.email}</p>
          <span>{auth.status === "syncing" ? "Syncing" : auth.status === "error" ? "Sync issue" : "Synced"}</span>
          {auth.error ? <p className="auth-error">{auth.error}</p> : null}
        </div>
        <button type="button" className="auth-icon-button" onClick={() => void auth.signOut()} aria-label="Sign out">
          <LogOut size={16} />
        </button>
      </section>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "sign-in") {
      await auth.signIn(email, password);
    } else {
      await auth.signUp(email, password);
    }
  };

  return (
    <form className="auth-form" onSubmit={(event) => void submit(event)}>
      <div className="auth-form__header">
        <Cloud size={18} />
        <div>
          <h3>Cloud save</h3>
          <p>Sign in to sync progress across devices.</p>
        </div>
      </div>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        autoComplete="email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
        minLength={6}
        required
      />
      {auth.error ? <p className="auth-error">{auth.error}</p> : null}
      <div className="auth-form__actions">
        <button type="submit" disabled={auth.status === "loading" || auth.status === "syncing"}>
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          className="auth-form__secondary"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        >
          {mode === "sign-in" ? "New account" : "Have account"}
        </button>
      </div>
    </form>
  );
}
