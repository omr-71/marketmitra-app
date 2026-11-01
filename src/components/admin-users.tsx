import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Download, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getAdminUserDetail,
  getAdminUsers,
  getAdminUsersExport,
  type AdminUser,
} from "@/lib/admin.functions";

type SortKey = "created_at" | "name" | "email";

const panelClass = "rounded-3xl border border-[oklch(1_0_0/0.09)] bg-[oklch(1_0_0/0.04)] p-5";
const mutedClass = "text-[oklch(0.72_0.02_150)]";

export function AdminUsers() {
  const listUsers = useServerFn(getAdminUsers);
  const listUsersForExport = useServerFn(getAdminUsersExport);
  const [search, setSearch] = useState("");
  const [settledSearch, setSettledSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [sort, setSort] = useState<SortKey>("created_at");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSettledSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const handleGlobalSearch = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (typeof value === "string") setSearch(value);
    };
    window.addEventListener("marketmitra-admin-user-search", handleGlobalSearch);
    return () => window.removeEventListener("marketmitra-admin-user-search", handleGlobalSearch);
  }, []);

  const args = {
    search: settledSearch,
    sort,
    ascending,
    role: roleFilter,
    page,
    pageSize: 25,
  };
  const users = useQuery({
    queryKey: ["admin", "users", args],
    queryFn: () => listUsers({ data: args }),
    retry: false,
    placeholderData: (previous) => previous,
  });

  const sortBy = (nextSort: SortKey) => {
    if (sort === nextSort) {
      setAscending((value) => !value);
    } else {
      setSort(nextSort);
      setAscending(nextSort !== "created_at");
    }
    setPage(1);
  };

  const exportUsers = useMutation({
    mutationFn: () =>
      listUsersForExport({
        data: { search: settledSearch, sort, ascending, role: roleFilter },
      }),
    onSuccess: (result) => {
      if (!result.users.length) {
        toast.info("No matching users were available to export.");
        return;
      }
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
      const header = ["Name", "Email", "User ID", "District", "State", "Registered", "Last sign-in", "Role"];
      const rows = result.users.map((user) => [
        user.fullName || "",
        user.email || "",
        user.userId,
        user.district || "",
        user.state || "",
        user.createdAt,
        user.lastSignInAt || "",
        user.role,
    ]);
    const csv = [header, ...rows].map((row) => row.map(quote).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
      link.download = `marketmitra-users.csv`;
    link.click();
    URL.revokeObjectURL(url);
      toast.success(`${result.total.toLocaleString("en-IN")} users exported.`);
    },
    onError: (error) => toast.error(error.message || "Could not export users."),
  });

  return (
    <section id="admin-users" className={`${panelClass} scroll-mt-20`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[oklch(0.84_0.02_150)]">
            Users
          </h2>
          <p className={`mt-1 text-xs ${mutedClass}`}>
            Registered accounts, fetched in pages. Private chat text and phone numbers are not
            shown.
          </p>
        </div>
        <p className="text-xs font-semibold text-[oklch(0.82_0.02_150)]">
          {users.data
            ? `${users.data.total.toLocaleString("en-IN")} accounts`
            : "Account count unavailable"}
        </p>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => void users.refetch()}
          disabled={users.isFetching}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.09] px-3 text-xs font-semibold hover:bg-white/[0.05] disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${users.isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
        <button
          type="button"
          onClick={() => exportUsers.mutate()}
          disabled={!users.data?.total || exportUsers.isPending}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.09] px-3 text-xs font-semibold hover:bg-white/[0.05] disabled:opacity-40"
        >
          <Download className="size-3.5" />
          {exportUsers.isPending ? "Preparing export..." : "Export all matches"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <label className="flex h-10 min-w-64 max-w-lg flex-1 items-center gap-2 rounded-xl border border-[oklch(1_0_0/0.1)] bg-[oklch(0_0_0/0.12)] px-3">
          <Search className={`size-4 ${mutedClass}`} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, district or state"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[oklch(0.6_0.02_150)]"
          />
        </label>
        <label className="flex h-10 items-center gap-2 rounded-xl border border-[oklch(1_0_0/0.1)] bg-[oklch(0.18_0.02_160)] px-3 text-xs font-semibold">
          Role
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as "all" | "admin" | "user");
              setPage(1);
            }}
            className="bg-transparent text-sm outline-none"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </label>
      </div>

      {users.isLoading ? (
        <div className="mt-5 h-32 animate-pulse rounded-2xl bg-[oklch(1_0_0/0.06)]" />
      ) : users.isError ? (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-[oklch(0.55_0.18_25/0.12)] p-3 text-sm text-[oklch(0.9_0.06_30)]"
        >
          Failed to load users: {users.error.message}
        </p>
      ) : !users.data || users.data.users.length === 0 ? (
        <p className={`mt-5 text-sm ${mutedClass}`}>
          {settledSearch ? "No users match this search." : "No registered users found."}
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="border-b border-[oklch(1_0_0/0.1)] text-[oklch(0.68_0.02_150)]">
                <tr>
                  <th className="pb-3 pr-4">
                    <SortButton
                      label="Name"
                      sortKey="name"
                      current={sort}
                      ascending={ascending}
                      onSort={sortBy}
                    />
                  </th>
                  <th className="pb-3 pr-4">
                    <SortButton
                      label="Email"
                      sortKey="email"
                      current={sort}
                      ascending={ascending}
                      onSort={sortBy}
                    />
                  </th>
                  <th className="pb-3 pr-4">User ID</th>
                  <th className="pb-3 pr-4">
                    <SortButton
                      label="Created"
                      sortKey="created_at"
                      current={sort}
                      ascending={ascending}
                      onSort={sortBy}
                    />
                  </th>
                  <th className="pb-3 pr-4">Last sign-in</th>
                  <th className="pb-3 pr-4">Role / profile</th>
                  <th className="pb-3">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[oklch(1_0_0/0.07)]">
                {users.data.users.map((user) => (
                  <tr
                    key={user.user_id}
                    tabIndex={0}
                    onClick={() => setSelectedUser(user)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedUser(user);
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-[oklch(1_0_0/0.04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[oklch(0.7_0.16_150)]"
                  >
                    <td className="py-3 pr-4 font-semibold">{user.full_name || "Name not set"}</td>
                    <td className="py-3 pr-4">{user.email ?? "Email unavailable"}</td>
                    <td className="max-w-40 truncate py-3 pr-4 font-mono text-[10px]">
                      {user.user_id}
                    </td>
                    <td className="py-3 pr-4">{formatDate(user.created_at)}</td>
                    <td className="py-3 pr-4">
                      {user.last_sign_in_at
                        ? formatDate(user.last_sign_in_at)
                        : "No sign-in recorded"}
                    </td>
                    <td className="py-3 pr-4">
                      <span>{user.role}</span>
                      <span className={`block mt-1 ${mutedClass}`}>
                        {user.profile_complete ? "Profile complete" : "Profile incomplete"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span>{user.conversation_count} conversations</span>
                      <span className={`block mt-1 ${mutedClass}`}>
                        {user.diagnosis_count} diagnoses
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className={`text-xs ${mutedClass}`}>
              Page {page} of {Math.max(1, Math.ceil(users.data.total / users.data.pageSize))}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || users.isFetching}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-lg bg-[oklch(1_0_0/0.08)] px-3 py-2 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={
                  page >= Math.ceil(users.data.total / users.data.pageSize) || users.isFetching
                }
                onClick={() => setPage((value) => value + 1)}
                className="rounded-lg bg-[oklch(1_0_0/0.08)] px-3 py-2 text-xs font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {selectedUser && <UserDetail user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </section>
  );
}

function SortButton({
  label,
  sortKey,
  current,
  ascending,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  ascending: boolean;
  onSort: (sort: SortKey) => void;
}) {
  const active = sortKey === current;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 font-bold hover:text-white"
    >
      {label}
      {active && (ascending ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
    </button>
  );
}

function UserDetail({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const loadDetail = useServerFn(getAdminUserDetail);
  const detail = useQuery({
    queryKey: ["admin", "user", user.user_id],
    queryFn: () => loadDetail({ data: { userId: user.user_id } }),
    retry: false,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="User details"
        className="h-full w-full max-w-xl overflow-y-auto border-l border-[oklch(1_0_0/0.1)] bg-[oklch(0.16_0.02_160)] p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">User details</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close user details"
            className="rounded-full p-2 hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        {detail.isLoading ? (
          <div className="mt-5 h-36 animate-pulse rounded-2xl bg-[oklch(1_0_0/0.06)]" />
        ) : detail.isError ? (
          <p role="alert" className="mt-5 text-sm text-[oklch(0.9_0.06_30)]">
            Failed to load user details: {detail.error.message}
          </p>
        ) : detail.data ? (
          <div className="mt-5 space-y-5">
            <DetailSection title="Profile">
              <DetailRow label="Name" value={detail.data.profile.fullName || "Not set"} />
              <DetailRow label="Email" value={detail.data.profile.email ?? "Unavailable"} />
              <DetailRow label="User ID" value={detail.data.profile.userId} />
              <DetailRow label="Role" value={detail.data.profile.role} />
              <DetailRow label="Created" value={formatDate(detail.data.profile.createdAt)} />
              <DetailRow
                label="Last activity"
                value={
                  detail.data.profile.lastSignInAt
                    ? formatDate(detail.data.profile.lastSignInAt)
                    : "No sign-in recorded"
                }
              />
              <DetailRow
                label="Location"
                value={
                  [detail.data.profile.district, detail.data.profile.state]
                    .filter(Boolean)
                    .join(", ") || "Not provided"
                }
              />
              <DetailRow label="Language" value={detail.data.profile.language ?? "Not set"} />
            </DetailSection>

            <DetailSection title={`Mitra AI · ${user.conversation_count} total conversations`}>
              {detail.data.conversations.length ? (
                <ul className="space-y-2 text-xs">
                  {detail.data.conversations.map((conversation) => (
                    <li key={conversation.id} className="flex justify-between gap-3">
                      <span className="font-mono text-[10px]">{conversation.id}</span>
                      <span>{formatDate(conversation.updatedAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${mutedClass}`}>No conversations recorded.</p>
              )}
              {detail.data.conversations.length > 0 && (
                <p className={`mt-2 text-xs ${mutedClass}`}>
                  Showing the 10 most recently updated or fewer.
                </p>
              )}
              <p className={`mt-3 text-xs ${mutedClass}`}>
                Conversation content is intentionally not displayed in the admin console.
              </p>
            </DetailSection>

            <DetailSection title={`Diagnoses · ${user.diagnosis_count} total`}>
              {detail.data.diagnoses.length ? (
                <ul className="space-y-3 text-xs">
                  {detail.data.diagnoses.map((diagnosis) => (
                    <li key={diagnosis.id} className="rounded-xl bg-black/15 p-3">
                      <p className="font-semibold">
                        {diagnosis.crop ?? "Crop not recorded"} ·{" "}
                        {diagnosis.condition ?? "Result unavailable"}
                      </p>
                      <p className={`mt-1 ${mutedClass}`}>
                        {diagnosis.provider ?? "Provider not recorded"} ·{" "}
                        {diagnosis.usable ? "Usable result" : "Unusable result"}
                      </p>
                      <p className={`mt-1 ${mutedClass}`}>{formatDate(diagnosis.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${mutedClass}`}>No diagnoses recorded.</p>
              )}
              {detail.data.diagnoses.length > 0 && (
                <p className={`mt-2 text-xs ${mutedClass}`}>Showing the 10 most recent or fewer.</p>
              )}
            </DetailSection>

            <DetailSection title="Activity & errors">
              {detail.data.errors.length ? (
                <ul className="space-y-3">
                  {detail.data.errors.map((error) => (
                    <li key={error.id} className="rounded-xl bg-black/15 p-3 text-xs">
                      <p className="font-semibold">
                        {error.service} · {error.severity} · {error.errorType}
                      </p>
                      <p className={`mt-1 ${mutedClass}`}>{error.message}</p>
                      <p className={`mt-1 ${mutedClass}`}>
                        {formatDate(error.createdAt)} ·{" "}
                        {error.resolvedAt ? "Resolved" : "Unresolved"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${mutedClass}`}>No user-linked errors recorded.</p>
              )}
              <p className={`mt-3 text-xs ${mutedClass}`}>
                Existing analytics events are anonymous and cannot be attributed to an account.
              </p>
            </DetailSection>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[oklch(1_0_0/0.08)] bg-[oklch(1_0_0/0.04)] p-4">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[oklch(0.8_0.02_150)]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-xs">
      <span className={mutedClass}>{label}</span>
      <span className="max-w-[70%] break-all text-right">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
