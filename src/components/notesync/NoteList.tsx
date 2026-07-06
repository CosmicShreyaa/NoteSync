import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Folder, Plus, Search, Star, StarOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { COLLABORATORS, type Note } from "@/lib/notesync-data";
import { useNotes } from "./store";

type Filter = "all" | "starred" | "shared" | "drafts";

export function NoteList({
  notes,
  selectedId,
  onSelect,
  heading,
}: {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  heading: string;
}) {
  const { addNote, toggleStar, listCollapsed, setListCollapsed } = useNotes();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let list = notes;
    if (filter === "starred") list = list.filter((n) => n.starred);
    if (filter === "shared") list = list.filter((n) => n.shared);
    if (filter === "drafts") list = list.filter((n) => n.draft);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (n) => n.title.toLowerCase().includes(q) || n.preview.toLowerCase().includes(q),
      );
    }
    return list;
  }, [notes, filter, query]);

  if (listCollapsed) {
    return (
      <div className="hidden shrink-0 border-r border-border bg-surface/60 lg:flex">
        <button
          onClick={() => setListCollapsed(false)}
          className="flex w-8 items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Expand notes list"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <section className="hidden w-[340px] shrink-0 flex-col border-r border-border bg-surface/60 lg:flex">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <button
          onClick={() => setListCollapsed(true)}
          className="-ml-1 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Collapse notes list"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="mr-auto truncate text-lg font-semibold tracking-tight">{heading}</h2>
        <button
          onClick={() => {
            const id = addNote();
            onSelect(id);
            toast.success("New note created");
          }}
          className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      <div className="relative px-4 pt-3">
        <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, people, tags…"
          className="w-full rounded-lg border border-input bg-surface-elevated py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="mt-3 flex gap-1 px-4 text-xs">
        {(["all", "starred", "shared", "drafts"] as Filter[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "rounded-full px-2.5 py-1 capitalize transition-colors",
              filter === t
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-2 pb-3">
        {filtered.map((n) => (
          <button
            key={n.id}
            onClick={() => onSelect(n.id)}
            className={cn(
              "group mb-1 block w-full rounded-lg border p-3 text-left transition-all",
              selectedId === n.id
                ? "border-border bg-surface-elevated shadow-sm"
                : "border-transparent hover:bg-surface-elevated/70",
            )}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none">{n.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-medium">{n.title}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(n.id);
                    }}
                    className="ml-auto text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 data-[on=true]:opacity-100"
                    data-on={!!n.starred}
                    aria-label={n.starred ? "Unstar" : "Star"}
                  >
                    {n.starred ? (
                      <Star className="h-3.5 w-3.5 fill-current text-primary" />
                    ) : (
                      <StarOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.preview}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Folder className="h-3 w-3" />
                    {n.folder}
                    <span className="mx-1">·</span>
                    {n.updated}
                  </div>
                  <AvatarStack ids={n.collaborators} size={18} />
                </div>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No notes here yet.
          </div>
        )}
      </div>
    </section>
  );
}

export function AvatarStack({ ids, size = 22 }: { ids: string[]; size?: number }) {
  const users = ids.map((id) => COLLABORATORS.find((c) => c.id === id)!).filter(Boolean);
  return (
    <div className="flex -space-x-1.5">
      {users.map((u) => (
        <div
          key={u.id}
          title={u.name}
          className="flex items-center justify-center rounded-full border-2 border-surface-elevated text-[9px] font-semibold text-white"
          style={{ background: u.colorVar, width: size, height: size }}
        >
          {u.initials}
        </div>
      ))}
    </div>
  );
}
