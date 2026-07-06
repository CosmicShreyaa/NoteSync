import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Check,
  ChevronDown,
  Code2,
  Folder,
  Italic,
  Link2,
  List,
  ListOrdered,
  Lock,
  MessageSquare,
  Moon,
  MoreHorizontal,
  Quote,
  Share2,
  Sun,
  Type,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";
import { COLLABORATORS, FOLDERS, type Note } from "@/lib/notesync-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotes } from "./store";
import { AvatarStack } from "./NoteList";

export function Editor({ note }: { note: Note }) {
  const { theme, toggle, mounted } = useTheme();
  const {
    updateTitle,
    toggleStar,
    deleteNote,
    updateContent,
    updateFolder,
    updateEmoji,
    addCollaborator,
    removeCollaborator,
    addComment,
    duplicateNote,
    collaborators: allCollabs,
  } = useNotes();

  const [saved, setSaved] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [titleVal, setTitleVal] = useState(note.title);
  const [bodyVal, setBodyVal] = useState(note.content ?? "");
  const [commentVal, setCommentVal] = useState("");
  const [inviteUserId, setInviteUserId] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setSaved(true);
    setTitleVal(note.title);
    setBodyVal(note.content ?? "");
  }, [note.id, note.title, note.content]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [bodyVal]);

  const onTitleChange = (v: string) => {
    setTitleVal(v);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updateTitle(note.id, v);
      setSaved(true);
    }, 800);
  };

  const onBodyChange = (v: string) => {
    setBodyVal(v);
    setSaved(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateContent(note.id, v);
      setSaved(true);
    }, 800);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentVal.trim()) return;
    addComment(note.id, commentVal.trim());
    setCommentVal("");
    toast.success("Comment added");
  };

  const handleFormat = (type: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let formattedText = "";
    switch (type) {
      case "bold":
        formattedText = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        formattedText = `*${selectedText || "italic text"}*`;
        break;
      case "code":
        formattedText = `\`${selectedText || "code"}\``;
        break;
      case "link":
        const url = prompt("Enter the URL:");
        if (url === null) return;
        formattedText = `[${selectedText || "link text"}](${url || "https://"})`;
        break;
      case "list":
        formattedText = `\n- ${selectedText || "item"}`;
        break;
      case "list-ordered":
        formattedText = `\n1. ${selectedText || "item"}`;
        break;
      case "quote":
        formattedText = `\n> ${selectedText || "quote"}`;
        break;
      default:
        return;
    }

    const newValue = text.substring(0, start) + formattedText + text.substring(end);
    onBodyChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 50);
  };

  const activeUsers = allCollabs.filter((c) => note.collaborators.includes(c.id));

  const copyLink = async () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/notes/${note.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <Folder className="h-4 w-4 shrink-0" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 shrink-0 rounded px-1.5 py-0.5 hover:bg-accent hover:text-foreground cursor-pointer transition-colors">
                <span className="shrink-0">{note.folder}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {FOLDERS.map((f) => (
                <DropdownMenuItem
                  key={f.slug}
                  onClick={() => {
                    updateFolder(note.id, f.name);
                    toast.success(`Moved to ${f.name}`);
                  }}
                  className={note.folder === f.name ? "bg-accent font-medium" : ""}
                >
                  {f.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span>/</span>
          <span className="truncate text-foreground">
            {note.emoji} {titleVal}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Wifi className="h-3 w-3" />
            Live · {activeUsers.filter((u) => u.status !== "idle").length} editing
          </div>

          <AvatarStack ids={note.collaborators} size={26} />

          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>

          <button
            onClick={toggle}
            suppressHydrationWarning
            aria-label="Toggle theme"
            className="rounded-md border border-border bg-surface p-2 text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                aria-label="More"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toggleStar(note.id)}>
                {note.starred ? "Remove from starred" : "Add to starred"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                duplicateNote(note);
                toast.success("Note duplicated!");
              }}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                updateFolder(note.id, "Trash");
                toast.success("Moved to Trash");
              }}>Move to trash</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  deleteNote(note.id);
                  toast.success("Note deleted permanently");
                }}
                className="text-destructive focus:text-destructive"
              >
                Delete permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex shrink-0 items-center gap-1 border-b border-border bg-surface/50 px-4 py-1.5 md:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title="Text style"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <Type className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleFormat("normal")}>Normal Text</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFormat("h1")} className="font-semibold">Heading 1</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFormat("h2")} className="font-semibold text-sm">Heading 2</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFormat("h3")} className="font-semibold text-xs">Heading 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ToolbarDivider />
        <ToolbarBtn icon={<Bold className="h-4 w-4" />} label="Bold" onClick={() => handleFormat("bold")} />
        <ToolbarBtn icon={<Italic className="h-4 w-4" />} label="Italic" onClick={() => handleFormat("italic")} />
        <ToolbarBtn icon={<Code2 className="h-4 w-4" />} label="Code" onClick={() => handleFormat("code")} />
        <ToolbarBtn icon={<Link2 className="h-4 w-4" />} label="Link" onClick={() => handleFormat("link")} />
        <ToolbarDivider />
        <ToolbarBtn icon={<List className="h-4 w-4" />} label="Bulleted list" onClick={() => handleFormat("list")} />
        <ToolbarBtn icon={<ListOrdered className="h-4 w-4" />} label="Numbered list" onClick={() => handleFormat("list-ordered")} />
        <ToolbarBtn icon={<Quote className="h-4 w-4" />} label="Quote" onClick={() => handleFormat("quote")} />

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          {saved ? (
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" /> Saved
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Syncing…
            </span>
          )}
          <span>·</span>
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Only invited
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <article className="mx-auto max-w-3xl px-6 py-10 md:px-10 md:py-14">
          <div className="mb-6 flex items-center gap-3 text-5xl">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-md p-1 hover:bg-accent cursor-pointer transition-colors"
                  aria-label="Change emoji"
                >
                  {note.emoji || "📝"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-2 grid grid-cols-5 gap-1 w-[220px]">
                {["📝", "✨", "💡", "📌", "🧠", "🌱", "🎯", "🪄", "🧭", "☀️", "🚀", "🧪", "🗺️", "🎨", "📓", "🧵", "📚", "📈", "✏️", "🔥"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => updateEmoji(note.id, emoji)}
                    className="flex h-9 w-9 items-center justify-center rounded text-xl hover:bg-accent transition-colors cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <input
            value={titleVal}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full bg-transparent font-display text-5xl leading-tight tracking-tight text-foreground caret-user-1 outline-none placeholder:text-muted-foreground md:text-6xl"
            placeholder="Untitled"
          />

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>
              Last edited by <b className="text-foreground">Diego</b> · 2 min ago
            </span>
            <span>·</span>
            <span>{note.collaborators.length} collaborators</span>
            <span>·</span>
            <span>{bodyVal.trim() ? bodyVal.trim().split(/\s+/).length : 0} words</span>
          </div>

          <textarea
            ref={textareaRef}
            value={bodyVal}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Start writing to bring this note to life…"
            className="mt-6 w-full min-h-[300px] bg-transparent text-foreground/90 outline-none resize-none placeholder:text-muted-foreground font-sans text-[15px] leading-7 focus-visible:outline-none"
          />

          {/* Comments Section */}
          <div className="mt-14 border-t border-border pt-8">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Comments ({note.comments?.length ?? 0})
            </h3>
            
            <div className="space-y-4 mb-6">
              {note.comments && note.comments.length > 0 ? (
                note.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface-elevated p-4 transition-all hover:shadow-sm">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: c.userColor }}
                    >
                      {c.userInitials}
                    </div>
                    <div className="text-sm flex-1 min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-semibold text-foreground">{c.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-foreground/90 break-words leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic pl-1">No comments yet. Write a thought below!</p>
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex gap-2 items-end">
              <input
                value={commentVal}
                onChange={(e) => setCommentVal(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-lg border border-input bg-surface-elevated px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98] cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </article>
      </div>

      <PresenceBar users={activeUsers} />

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share "{note.title}"</DialogTitle>
            <DialogDescription>
              Anyone with the link can view. Invited collaborators can edit in real time.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-input bg-surface-elevated p-2">
            <div className="flex-1 truncate font-mono text-xs text-muted-foreground">
              {typeof window !== "undefined" ? window.location.origin : "https://notesync.app"}
              /notes/{note.id}
            </div>
            <button
              onClick={copyLink}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 cursor-pointer"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">People with access</div>
            {activeUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-2 rounded-md p-1.5 hover:bg-accent/40">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: u.colorVar }}
                >
                  {u.initials}
                </div>
                <div className="text-sm">{u.name}</div>
                <div className="ml-auto text-xs text-muted-foreground capitalize">{u.status}</div>
                
                {u.id !== "u1" && (
                  <button
                    onClick={() => {
                      removeCollaborator(note.id, u.id);
                      toast.success(`Removed ${u.name}`);
                    }}
                    className="ml-2 rounded p-1 hover:bg-destructive/10 text-destructive hover:text-destructive hover:scale-105 transition-all text-xs cursor-pointer"
                    title="Remove access"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {allCollabs.filter(c => !note.collaborators.includes(c.id)).length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <div className="text-xs font-medium text-muted-foreground mb-2">Invite new collaborator</div>
              <div className="flex gap-2">
                <select
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                  className="flex-1 rounded-md border border-input bg-surface-elevated px-3 py-1.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Select a person...</option>
                  {allCollabs
                    .filter((c) => !note.collaborators.includes(c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.initials})
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => {
                    if (inviteUserId) {
                      addCollaborator(note.id, inviteUserId);
                      const u = allCollabs.find(c => c.id === inviteUserId);
                      toast.success(`Invited ${u?.name || "collaborator"}`);
                      setInviteUserId("");
                    }
                  }}
                  disabled={!inviteUserId}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                >
                  Invite
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ToolbarBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick || (() => toast(`${label} (mock)`))}
      title={label}
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
    >
      {icon}
    </button>
  );
}
function ToolbarDivider() {
  return <div className="mx-1 h-4 w-px bg-border" />;
}

function PresenceBar({ users }: { users: typeof COLLABORATORS }) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-t border-border bg-surface/70 px-4 py-2 text-xs md:px-6">
      <span className="text-muted-foreground">In this note</span>
      <div className="flex flex-wrap items-center gap-3">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                background: u.colorVar,
                boxShadow:
                  u.status !== "idle"
                    ? `0 0 0 3px color-mix(in oklab, ${u.colorVar} 30%, transparent)`
                    : "none",
              }}
            />
            <span className="text-foreground/90">{u.name}</span>
            <span className="text-muted-foreground">· {u.status}</span>
          </div>
        ))}
      </div>
      <div className="ml-auto hidden items-center gap-2 text-muted-foreground sm:flex">
        <span>ws://notesync · rtt 42ms</span>
      </div>
    </div>
  );
}
