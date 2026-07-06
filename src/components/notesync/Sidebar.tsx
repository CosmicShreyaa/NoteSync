import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  FileText,
  Folder,
  Hash,
  History,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FOLDERS, TAGS } from "@/lib/notesync-data";
import { useNotes } from "./store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { notes } = useNotes();

  const counts = {
    inbox: notes.filter((n) => n.shared && n.folder !== "Trash").length,
    starred: notes.filter((n) => n.starred && n.folder !== "Trash").length,
    shared: notes.filter((n) => n.shared && n.folder !== "Trash").length,
    recent: notes.filter((n) => n.folder !== "Trash").length,
  };
  const folderCounts = Object.fromEntries(
    FOLDERS.map((f) => [f.slug, notes.filter((n) => n.folder === f.name).length]),
  );

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 px-4 py-4 transition-opacity hover:opacity-80 text-left w-full cursor-pointer focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <FileText className="h-4 w-4" strokeWidth={2.4} />
            </div>
            <div className="leading-tight flex-1">
              <div className="text-sm font-semibold">NoteSync</div>
              <div className="text-[11px] text-muted-foreground">Maya's workspace</div>
            </div>
            <div className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <ChevronDown className="h-4 w-4" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52" align="start">
          <DropdownMenuItem onClick={() => toast.success("Switched to Maya's workspace")} className="font-medium bg-accent">
            Maya's workspace
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Acme Corp Workspace is empty. Seeding...")}>
            Acme Corp Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Switched to Personal Sandbox")}>
            Personal Sandbox
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast("Create workspace form (mock)")} className="text-primary font-medium">
            + Create Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <nav className="flex flex-col gap-0.5 px-2 pb-2 text-sm">
        <NavLink
          to="/inbox"
          icon={<Sparkles className="h-4 w-4" />}
          label="Inbox"
          badge={String(counts.inbox)}
          active={pathname === "/inbox"}
        />
        <NavLink
          to="/starred"
          icon={<Star className="h-4 w-4" />}
          label="Starred"
          badge={String(counts.starred)}
          active={pathname === "/starred"}
        />
        <NavLink
          to="/shared"
          icon={<Users className="h-4 w-4" />}
          label="Shared with me"
          active={pathname === "/shared"}
        />
        <NavLink
          to="/"
          icon={<History className="h-4 w-4" />}
          label="Recent"
          badge={String(counts.recent)}
          active={pathname === "/"}
        />
      </nav>

      <div className="mt-2 px-4 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Folders
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {FOLDERS.map((f) => (
          <NavLink
            key={f.slug}
            to="/folders/$folder"
            params={{ folder: f.slug }}
            icon={<Folder className="h-4 w-4" />}
            label={f.name}
            badge={String(folderCounts[f.slug] ?? 0)}
            active={pathname === `/folders/${f.slug}`}
          />
        ))}

        <div className="mt-4 px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Tags
        </div>
        {TAGS.map((t) => (
          <NavLink
            key={t}
            to="/tags/$tag"
            params={{ tag: t }}
            icon={<Hash className="h-4 w-4" />}
            label={t}
            active={pathname === `/tags/${t}`}
          />
        ))}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-lg bg-surface-elevated p-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
            style={{ background: "var(--user-1)" }}
          >
            MC
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-medium">Maya Chen</div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

type NavLinkProps = {
  to: string;
  params?: Record<string, string>;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
};

const AnyLink = Link as unknown as React.ComponentType<{
  to: string;
  params?: Record<string, string>;
  className?: string;
  children?: React.ReactNode;
}>;

function NavLink({ to, params, icon, label, badge, active }: NavLinkProps) {
  return (
    <AnyLink
      to={to}
      params={params}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {badge}
        </span>
      )}
    </AnyLink>
  );
}
