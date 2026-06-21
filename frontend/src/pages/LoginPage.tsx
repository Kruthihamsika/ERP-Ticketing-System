import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, LockKeyhole, ShieldCheck, Sparkles, Ticket } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import type { LoginPayload } from "../types";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState } = useForm<LoginPayload>({
    defaultValues: { email: "", password: "" }
  });

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(values: LoginPayload) {
    try {
      setError("");
      await login(values);
      navigate(from, { replace: true });
    } catch {
      setError("Invalid email or password. Check your credentials and try again.");
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden p-10 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.35),transparent_28rem),radial-gradient(circle_at_80%_40%,rgba(20,184,166,0.20),transparent_24rem)]" />
        <div className="relative z-10 flex h-full flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.06] p-10 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold">ERP Desk</p>
              <p className="text-sm text-white/60">Enterprise service command center</p>
            </div>
          </div>

          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Premium ticket operations for modern teams
            </div>
            <h1 className="max-w-2xl text-6xl font-bold leading-[1.02] tracking-tight text-white">
              Resolve enterprise work faster, with sharper visibility.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">
              A polished operations layer for support queues, SLA pressure, workload visibility, and executive analytics.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "SLA governance", icon: ShieldCheck },
              { label: "Live analytics", icon: BarChart3 },
              { label: "Secure access", icon: LockKeyhole }
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white">
                <item.icon className="h-6 w-6 text-cyan-300" />
                <p className="mt-4 text-sm font-semibold">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-50 p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Ticket className="h-6 w-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Welcome back</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Sign in to your console</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use your ERP Ticketing credentials to access dashboards, tickets, comments, and attachments.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input className="input" type="email" placeholder="admin@company.com" {...register("email", { required: true })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input className="input" type="password" placeholder="Enter your password" {...register("password", { required: true })} />
            </div>
            {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
            <button className="btn-primary w-full" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Signing in..." : "Open dashboard"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
