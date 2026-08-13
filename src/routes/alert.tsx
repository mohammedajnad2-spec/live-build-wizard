import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alert")({
  beforeLoad: () => {
    throw redirect({ to: "/sos", replace: true });
  },
});
