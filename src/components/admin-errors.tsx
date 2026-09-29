import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { getAdminErrors, resolveAdminError } from "@/lib/admin.functions";

type Service =
  "all" | "mitra_ai" | "diagnosis" | "weather" | "authentication" | "database" | "market_data";
type Severity = "all" | "warning" | "error" | "critical";
type Status = "all" | "unresolved" | "resolved";

export function AdminErrors() {
  const queryClient = useQueryClient();
  const loadErrors = useServerFn(getAdminErrors);
  const resolveError = useServerFn(resolveAdminError);
  const [service, setService] = useState<Service>("all");
  const [severity, setSeverity] = useState<Severity>("all");
  const [status, setStatus] = useState<Status>("unresolved");
  const [date, setDate] = useState("");
  const filters = {
    service,
    severity,
    status,
    since: date ? new Date(`${date}T00:00:00`).toISOString() : null,
  };

  const errors = useQuery({
    queryKey: ["admin", "errors", filters],
    queryFn: () => loadErrors({ data: filters }),
    retry: false,
  });
  const resolve = useMutation({
    mutationFn: resolveError,
    onSuccess: () => {
      toast.success("Error marked resolved.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "errors"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <section
      id="admin-errors"
      className="scroll-mt-20 rounded-3xl border border-[oklch(1_0_0/0.09)] bg-[oklch(1_0_0/0.04)] p-5"
    >
      <div>
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[oklch(0.84_0.02_150)]">
          Error center
        </h2>
        <p className="mt-1 text-xs text-[oklch(0.72_0.02_150)]">
          Recent provider and application failures. Messages are scrubbed before storage.
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label="Service"
          value={service}
          onChange={(value) => setService(value as Service)}
          options={[
            ["all", "All services"],
            ["mitra_ai", "Mitra AI"],
            ["diagnosis", "Diagnosis"],
            ["market_data", "Market data"],
            ["weather", "Weather"],
            ["authentication", "Authentication"],
            ["database", "Database"],
          ]}
        />
        <FilterSelect
          label="Severity"
          value={severity}
          onChange={(value) => setSeverity(value as Severity)}
          options={[
            ["all", "All severities"],
            ["warning", "Warning"],
            ["error", "Error"],
            ["critical", "Critical"],
          ]}
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={(value) => setStatus(value as Status)}
          options={[
            ["unresolved", "Unresolved"],
            ["resolved", "Resolved"],
            ["all", "All statuses"],
          ]}
        />
        <label className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.7_0.02_150)]">
          From date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 block h-9 w-full rounded-lg border border-white/10 bg-black/15 px-2 text-xs normal-case text-white"
          />
        </label>
      </div>

      {errors.isLoading ? (
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-white/5" />
      ) : errors.isError ? (
        <p role="alert" className="mt-4 text-sm text-[oklch(0.9_0.06_30)]">
          Failed to load errors: {errors.error.message}
        </p>
      ) : !errors.data?.length ? (
        <p className="mt-4 text-sm text-[oklch(0.72_0.02_150)]">No matching error records.</p>
      ) : (
        <ul className="mt-4 divide-y divide-[oklch(1_0_0/0.07)]">
          {errors.data.map((error) => (
            <li key={error.id} className="flex flex-wrap items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <span className="rounded-full bg-white/10 px-2 py-1">
                    {error.service.replaceAll("_", " ")}
                  </span>
                  <span
                    className={
                      error.severity === "critical" || error.severity === "error"
                        ? "text-red-300"
                        : "text-amber-200"
                    }
                  >
                    {error.severity}
                  </span>
                  <span className="text-[oklch(0.65_0.02_150)]">
                    {error.resolved_at ? "resolved" : "unresolved"}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold">{error.error_type}</p>
                <p className="mt-1 break-words text-xs text-[oklch(0.76_0.02_150)]">
                  {error.message}
                </p>
                <p className="mt-2 text-[10px] text-[oklch(0.65_0.02_150)]">
                  {new Date(error.created_at).toLocaleString("en-IN")}
                  {error.provider ? ` · ${error.provider}` : ""}
                  {error.user_id ? ` · user ${error.user_id}` : ""}
                  {error.request_id ? ` · request ${error.request_id}` : ""}
                </p>
              </div>
              {!error.resolved_at && (
                <button
                  type="button"
                  disabled={resolve.isPending}
                  onClick={() => resolve.mutate({ data: { id: error.id } })}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  <Check className="size-3.5" />
                  Resolve
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.7_0.02_150)]">
      {label}
      <span className="relative mt-1 block">
        <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2" />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-white/10 bg-[oklch(0.18_0.02_160)] pl-7 pr-2 text-xs normal-case text-white"
        >
          {options.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
