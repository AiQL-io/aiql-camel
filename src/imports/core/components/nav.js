export const MODULES = [
  {
    id: "command",
    href: "/",
    icon: "squares-four",
    labelKey: "nav.commandCenter",
  },
  {
    id: "registry",
    href: "/registry",
    icon: "identification-card",
    labelKey: "nav.registry",
  },
  { id: "verify", href: "/verify", icon: "git-fork", labelKey: "nav.verify" },
  {
    id: "genetics",
    href: "/genetics",
    icon: "chart-scatter",
    labelKey: "nav.genetics",
  },
  {
    id: "integrity",
    href: "/integrity",
    icon: "shield-check",
    labelKey: "nav.integrity",
  },
  {
    id: "reports",
    href: "/reports",
    icon: "certificate",
    labelKey: "nav.reports",
  },
  {
    id: "admin",
    href: "/admin",
    icon: "gear-six",
    labelKey: "nav.admin",
    cap: "manageAdmin",
  },
];

export function activeModuleId(pathname) {
  if (!pathname || pathname === "/") return "command";
  const seg = "/" + pathname.split("/").filter(Boolean)[0];
  const match = MODULES.find((m) => m.href === seg);
  return match ? match.id : "command";
}
