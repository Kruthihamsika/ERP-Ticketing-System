import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  FileText,
  Flag,
  Send,
} from "lucide-react";

import { useToast } from "../components/ui/Toast";
import { SectionHeader } from "../components/ui/SectionHeader";
import { createTicket } from "../services/tickets";

import {
  departments,
  priorities,
  type TicketCreatePayload,
} from "../types";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TicketCreatePayload>({
    defaultValues: {
      department: "IT",
      priority: "MEDIUM",
      title: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      showToast("Ticket created successfully");
      navigate("/tickets");
    },
    onError: () => {
      showToast("Unable to create ticket", "error");
    },
  });

  async function onSubmit(
    values: TicketCreatePayload
  ) {
    await createMutation.mutateAsync(values);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-slate-50 to-cyan-50 p-8 shadow-sm">
        <SectionHeader
          eyebrow="New Request"
          title="Create Ticket"
          description="Capture incidents, service requests, or operational issues with clear business context."
          action={
            <Link
              to="/tickets"
              className="btn-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          }
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 xl:grid-cols-[1fr_340px]"
      >
        <div className="card p-8">
          <div className="space-y-8">
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <ClipboardList className="h-4 w-4 text-brand-600" />
                Ticket Title
              </label>

              <input
                className="input"
                placeholder="Example: Laptop cannot connect to VPN"
                {...register("title", {
                  required: "Ticket title is required",
                  minLength: {
                    value: 5,
                    message:
                      "Title must contain at least 5 characters",
                  },
                })}
              />

              {errors.title && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Building2 className="h-4 w-4 text-brand-600" />
                  Department
                </label>

                <select
                  className="input"
                  {...register("department")}
                >
                  {departments.map(
                    (department) => (
                      <option
                        key={department}
                        value={department}
                      >
                        {department}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Flag className="h-4 w-4 text-brand-600" />
                  Priority
                </label>

                <select
                  className="input"
                  {...register("priority")}
                >
                  {priorities.map((priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-brand-600" />
                Description
              </label>

              <textarea
                rows={10}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="Describe the issue, impact, affected users, expected outcome, and any troubleshooting already attempted."
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 20,
                    message:
                      "Description should contain at least 20 characters",
                  },
                })}
              />

              {errors.description && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold">
              Submission Guide
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• Use a clear and concise title.</li>
              <li>• Include business impact.</li>
              <li>• Mention affected systems.</li>
              <li>• Include troubleshooting steps.</li>
              <li>• Select the correct priority.</li>
            </ul>
          </div>

          <div className="card p-6">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                createMutation.isPending
              }
              className="btn-primary w-full"
            >
              <Send className="h-4 w-4" />

              {isSubmitting ||
              createMutation.isPending
                ? "Creating..."
                : "Create Ticket"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}