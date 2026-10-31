import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/schemes")({
  component: SchemesLayout,
});

function SchemesLayout() {
  return <Outlet />;
}
