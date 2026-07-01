"use client";

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { OutreachStatus, OutreachTask, Profile } from "@/lib/outreach/types";

const taskSelect = [
  "id",
  "batch_id",
  "organization_name",
  "organization_type",
  "organization_website",
  "fit_reason",
  "contact_name",
  "contact_email",
  "draft_email",
  "draft_subject",
  "assigned_to",
  "assigned_manager_number",
  "status",
  "manager_notes",
  "sent_at",
  "sent_by",
  "created_at",
  "updated_at",
  "profiles:assigned_to(id,email,full_name,manager_number)",
].join(",");

const statusLabels: Record<OutreachStatus, string> = {
  pending_review: "Pending",
  needs_edit: "Needs edit",
  approved: "Approved",
  sent: "Sent",
  rejected: "Rejected",
  failed: "Failed",
};

const statusClasses: Record<OutreachStatus, string> = {
  pending_review: "border-gold/30 bg-gold/10 text-gold-bright",
  needs_edit: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  approved: "border-green-bright/30 bg-green-bright/10 text-green-bright",
  sent: "border-green-bright/40 bg-green-bright/15 text-green-bright",
  rejected: "border-red-400/30 bg-red-400/10 text-red-200",
  failed: "border-red-400/30 bg-red-400/10 text-red-200",
};

function formatDate(value: string | null) {
  if (!value) return "Not sent";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function managerLabel(profile?: Pick<Profile, "email" | "full_name" | "manager_number"> | null) {
  if (!profile) return "Unassigned";
  const name = profile.full_name || profile.email;
  return profile.manager_number ? `#${profile.manager_number} · ${name}` : name;
}

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const variants = {
    primary: "bg-cream text-ink hover:bg-gold-bright",
    secondary: "border border-white/12 bg-white/[0.04] text-cream hover:bg-white/[0.08]",
    danger: "border border-red-400/30 bg-red-400/10 text-red-100 hover:bg-red-400/15",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

function LoginForm({
  onLogin,
  loading,
  error,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="min-h-screen bg-ink px-5 py-8 text-cream sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onLogin(email, password);
          }}
          className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30"
        >
          <Link href="/" className="display text-sm font-bold tracking-[0.16em] text-cream">
            SHERWOOD
          </Link>
          <h1 className="mt-8 text-2xl font-semibold text-cream">Outreach sign in</h1>
          <div className="mt-6 space-y-4">
            <label className="block text-sm text-cream/70">
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="mt-2 w-full rounded-lg border border-white/10 bg-ink/80 px-3 py-3 text-cream outline-none transition focus:border-gold/60"
              />
            </label>
            <label className="block text-sm text-cream/70">
              Password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                className="mt-2 w-full rounded-lg border border-white/10 bg-ink/80 px-3 py-3 text-cream outline-none transition focus:border-gold/60"
              />
            </label>
          </div>
          {error ? <p className="mt-4 rounded-lg bg-red-400/10 p-3 text-sm text-red-100">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-cream px-4 py-3 text-sm font-semibold text-ink transition hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

function TaskRow({
  task,
  notes,
  onNotesChange,
  onStatus,
  onCopy,
  master,
}: {
  task: OutreachTask;
  notes: string;
  onNotesChange: (value: string) => void;
  onStatus: (status: OutreachStatus) => void;
  onCopy: () => void;
  master: boolean;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-cream">{task.organization_name}</h3>
            <span className={`rounded-full border px-2 py-1 text-xs ${statusClasses[task.status]}`}>
              {statusLabels[task.status]}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-cream/55">
            <span>{task.organization_type || "Organization"}</span>
            {task.organization_website ? (
              <a
                href={task.organization_website}
                target="_blank"
                rel="noreferrer"
                className="text-gold-bright hover:text-gold"
              >
                {task.organization_website}
              </a>
            ) : null}
            {master ? <span>{managerLabel(task.profiles)}</span> : null}
          </div>
        </div>
        <div className="text-sm text-cream/45">{formatDate(task.sent_at)}</div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <dt className="text-cream/40">Fit</dt>
          <dd className="mt-1 leading-6 text-cream/75">{task.fit_reason || "No fit reason supplied."}</dd>
        </div>
        <div>
          <dt className="text-cream/40">Contact</dt>
          <dd className="mt-1 leading-6 text-cream/75">
            {task.contact_name || "Unknown"} ·{" "}
            <a href={`mailto:${task.contact_email}`} className="text-gold-bright hover:text-gold">
              {task.contact_email}
            </a>
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-lg border border-white/8 bg-ink/50 p-4">
        <div className="text-sm font-medium text-cream">{task.draft_subject || "Draft email"}</div>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-cream/70">{task.draft_email}</pre>
      </div>

      <div className="mt-4">
        <label className="block text-sm text-cream/45">
          Manager notes
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={2}
            className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-ink/70 px-3 py-2 text-sm text-cream outline-none transition focus:border-gold/60"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onCopy} variant="secondary">
          Copy draft
        </Button>
        <Button onClick={() => onStatus("sent")}>Mark sent</Button>
        <Button onClick={() => onStatus("needs_edit")} variant="secondary">
          Needs edit
        </Button>
        <Button onClick={() => onStatus("rejected")} variant="danger">
          Reject
        </Button>
      </div>
    </article>
  );
}

export default function OutreachDashboard() {
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => (configured ? createSupabaseBrowserClient() : null), [configured]);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<OutreachTask[]>([]);
  const [managers, setManagers] = useState<Profile[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(() => configured);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = useCallback(
    async (client: SupabaseClient, activeSession: Session) => {
      setError(null);
      const { data: profileRow, error: profileError } = await client
        .from("profiles")
        .select("id,email,full_name,role,manager_number,active")
        .eq("id", activeSession.user.id)
        .maybeSingle<Profile>();

      if (profileError) throw profileError;
      setProfile(profileRow);

      if (!profileRow) {
        setTasks([]);
        setManagers([]);
        return;
      }

      let taskQuery = client.from("outreach_tasks").select(taskSelect).order("created_at", { ascending: false });
      if (profileRow.role !== "master") {
        taskQuery = taskQuery.eq("assigned_to", profileRow.id);
      }

      const [{ data: taskRows, error: taskError }, { data: managerRows, error: managerError }] =
        await Promise.all([
          taskQuery,
          profileRow.role === "master"
            ? client
                .from("profiles")
                .select("id,email,full_name,role,manager_number,active")
                .eq("role", "outreach_manager")
                .order("manager_number", { ascending: true })
            : Promise.resolve({ data: [], error: null }),
        ]);

      if (taskError) throw taskError;
      if (managerError) throw managerError;

      const nextTasks = (taskRows ?? []) as unknown as OutreachTask[];
      setTasks(nextTasks);
      setManagers((managerRows ?? []) as Profile[]);
      setNotes(
        Object.fromEntries(nextTasks.map((task) => [task.id, task.manager_notes ?? ""])),
      );
    },
    [],
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    let mounted = true;

    async function initialize() {
      setLoading(true);
      const { data } = await client.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        await loadData(client, data.session).catch((loadError: Error) => {
          if (mounted) setError(loadError.message);
        });
      }
      if (mounted) setLoading(false);
    }

    void initialize();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        void loadData(client, nextSession).catch((loadError: Error) => setError(loadError.message));
      } else {
        setProfile(null);
        setTasks([]);
        setManagers([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadData, supabase]);

  const summary = useMemo(() => {
    const byManager = new Map<string, { label: string; assigned: number; sent: number; pending: number }>();
    for (const manager of managers) {
      byManager.set(manager.id, {
        label: managerLabel(manager),
        assigned: 0,
        sent: 0,
        pending: 0,
      });
    }
    for (const task of tasks) {
      const key = task.assigned_to || "unassigned";
      const existing =
        byManager.get(key) ??
        {
          label: managerLabel(task.profiles),
          assigned: 0,
          sent: 0,
          pending: 0,
        };
      existing.assigned += 1;
      if (task.status === "sent") existing.sent += 1;
      if (!["sent", "rejected"].includes(task.status)) existing.pending += 1;
      byManager.set(key, existing);
    }
    return Array.from(byManager.values()).filter((row) => row.assigned > 0 || profile?.role === "master");
  }, [managers, profile?.role, tasks]);

  async function login(email: string, password: string) {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) setError(loginError.message);
    setLoading(false);
  }

  async function updateTask(task: OutreachTask, status: OutreachStatus) {
    if (!supabase || !session) return;
    setActionLoading(task.id);
    setError(null);
    setMessage(null);

    const patch: Partial<OutreachTask> = {
      status,
      manager_notes: notes[task.id] ?? "",
    };

    if (status === "sent") {
      patch.sent_at = new Date().toISOString();
      patch.sent_by = session.user.id;
    }

    const { error: updateError } = await supabase.from("outreach_tasks").update(patch).eq("id", task.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Task updated.");
      await loadData(supabase, session).catch((loadError: Error) => setError(loadError.message));
    }

    setActionLoading(null);
  }

  async function copyDraft(task: OutreachTask) {
    const text = `${task.draft_subject || "Draft email"}\n\n${task.draft_email}`;
    await navigator.clipboard.writeText(text);
    setMessage("Draft copied.");
  }

  if (!configured) {
    return (
      <main className="min-h-screen bg-ink px-5 py-8 text-cream sm:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <h1 className="text-2xl font-semibold">Supabase is not configured</h1>
          <p className="mt-3 text-cream/65">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the site environment.
          </p>
        </div>
      </main>
    );
  }

  if (!session) {
    return <LoginForm onLogin={login} loading={loading} error={error} />;
  }

  const isMaster = profile?.role === "master";
  const pendingTasks = tasks.filter((task) => !["sent", "rejected"].includes(task.status));
  const visibleTasks = isMaster ? tasks : pendingTasks;

  return (
    <main className="min-h-screen bg-ink px-5 py-6 text-cream sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="display text-sm font-bold tracking-[0.16em] text-cream">
              SHERWOOD
            </Link>
            <h1 className="mt-4 text-3xl font-semibold text-cream">Outreach tasks</h1>
            <p className="mt-2 text-sm text-cream/55">
              {profile
                ? `${profile.role === "master" ? "Master" : "Manager"}${profile.manager_number ? ` #${profile.manager_number}` : ""} · ${profile.email}`
                : session.user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                if (supabase && session) {
                  void loadData(supabase, session);
                }
              }}
              variant="secondary"
            >
              Refresh
            </Button>
            <Button
              onClick={() => {
                void supabase?.auth.signOut();
              }}
              variant="secondary"
            >
              Sign out
            </Button>
          </div>
        </header>

        {error ? <p className="mt-4 rounded-lg bg-red-400/10 p-3 text-sm text-red-100">{error}</p> : null}
        {message ? <p className="mt-4 rounded-lg bg-green-bright/10 p-3 text-sm text-green-bright">{message}</p> : null}
        {!profile && !loading ? (
          <p className="mt-4 rounded-lg bg-gold/10 p-3 text-sm text-gold-bright">
            Your login exists, but no outreach profile was found.
          </p>
        ) : null}

        <section className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="text-2xl font-semibold">{tasks.length}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-cream/45">Total</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="text-2xl font-semibold">{pendingTasks.length}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-cream/45">Pending</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="text-2xl font-semibold">{tasks.filter((task) => task.status === "sent").length}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-cream/45">Sent</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="text-2xl font-semibold">{tasks.filter((task) => task.status === "needs_edit").length}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-cream/45">Needs edit</div>
          </div>
        </section>

        {isMaster ? (
          <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <h2 className="text-lg font-semibold">Manager progress</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-cream/45">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Manager</th>
                    <th className="py-2 pr-4 font-medium">Assigned</th>
                    <th className="py-2 pr-4 font-medium">Pending</th>
                    <th className="py-2 pr-4 font-medium">Sent</th>
                    <th className="py-2 pr-4 font-medium">Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((row) => (
                    <tr key={row.label} className="border-t border-white/8">
                      <td className="py-3 pr-4 text-cream/80">{row.label}</td>
                      <td className="py-3 pr-4">{row.assigned}</td>
                      <td className="py-3 pr-4">{row.pending}</td>
                      <td className="py-3 pr-4">{row.sent}</td>
                      <td className="py-3 pr-4">
                        {row.assigned ? `${Math.round((row.sent / row.assigned) * 100)}%` : "0%"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="mt-6 space-y-3">
          {visibleTasks.length ? (
            visibleTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                notes={notes[task.id] ?? ""}
                master={isMaster}
                onNotesChange={(value) => setNotes((current) => ({ ...current, [task.id]: value }))}
                onCopy={() => {
                  void copyDraft(task);
                }}
                onStatus={(status) => {
                  void updateTask(task, status);
                }}
              />
            ))
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-8 text-center text-cream/55">
              {loading ? "Loading tasks" : "No outreach tasks"}
            </div>
          )}
        </section>

        {actionLoading ? <div className="fixed bottom-4 right-4 rounded-lg bg-cream px-4 py-3 text-sm text-ink">Saving</div> : null}
      </div>
    </main>
  );
}
