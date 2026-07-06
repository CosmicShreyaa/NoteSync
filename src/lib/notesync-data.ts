export type Collaborator = {
  id: string;
  name: string;
  colorVar: string;
  initials: string;
  status: "editing" | "viewing" | "idle";
};

export type NoteComment = {
  id: string;
  userName: string;
  userInitials: string;
  userColor: string;
  content: string;
  createdAt: string;
};

export type Note = {
  id: string;
  emoji: string;
  title: string;
  preview: string;
  content?: string;
  updated: string;
  starred?: boolean;
  folder: string;
  tags?: string[];
  shared?: boolean;
  draft?: boolean;
  collaborators: string[];
  comments?: NoteComment[];
};

export const COLLABORATORS: Collaborator[] = [
  { id: "u1", name: "Maya Chen", colorVar: "var(--user-1)", initials: "MC", status: "editing" },
  { id: "u2", name: "Diego Ruiz", colorVar: "var(--user-2)", initials: "DR", status: "editing" },
  { id: "u3", name: "Priya N.", colorVar: "var(--user-3)", initials: "PN", status: "viewing" },
  { id: "u4", name: "Ola Berg", colorVar: "var(--user-4)", initials: "OB", status: "idle" },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: "n1",
    emoji: "🚀",
    title: "Q3 Launch — Kickoff notes",
    preview: "Positioning, target beta cohort, and the rollout timeline for the new editor…",
    updated: "just now",
    starred: true,
    folder: "Product",
    tags: ["launch", "specs"],
    shared: true,
    collaborators: ["u1", "u2", "u3"],
  },
  {
    id: "n2",
    emoji: "🧪",
    title: "Research: async writing rituals",
    preview: "Interview highlights from 12 remote teams — surprising overlap around Fridays…",
    updated: "12m ago",
    folder: "Research",
    tags: ["research"],
    shared: true,
    collaborators: ["u1", "u4"],
  },
  {
    id: "n3",
    emoji: "🗺️",
    title: "Roadmap — next two quarters",
    preview: "Themes: real-time first, offline-safe, and rich embeds. Cutlines below…",
    updated: "1h ago",
    starred: true,
    folder: "Product",
    tags: ["specs"],
    shared: true,
    collaborators: ["u2", "u3"],
  },
  {
    id: "n4",
    emoji: "🎨",
    title: "Design system tokens v2",
    preview: "Semantic color pass, radii scale, motion primitives, and dark mode audit…",
    updated: "3h ago",
    folder: "Design",
    tags: ["specs", "meta"],
    shared: true,
    collaborators: ["u1", "u3", "u4"],
  },
  {
    id: "n5",
    emoji: "📓",
    title: "Weekly journal",
    preview: "What worked, what didn't, and the one thing to try next week…",
    updated: "Yesterday",
    folder: "Personal",
    tags: ["meta"],
    draft: true,
    collaborators: ["u1"],
  },
  {
    id: "n6",
    emoji: "🧵",
    title: "Meeting — Growth sync",
    preview: "Attribution weirdness on paid channels; homepage variant B is the winner…",
    updated: "Yesterday",
    folder: "Meetings",
    tags: ["meta"],
    shared: true,
    collaborators: ["u2", "u4"],
  },
  {
    id: "n7",
    emoji: "📚",
    title: "Reading list — Systems design",
    preview: "CRDTs, operational transforms, and the case for eventual consistency…",
    updated: "2d ago",
    folder: "Personal",
    tags: ["research"],
    collaborators: ["u1", "u3"],
  },
  {
    id: "n8",
    emoji: "📈",
    title: "Weekly metrics review",
    preview: "Activation is up 6.2% WoW; retention flat. Notes on the retention experiment…",
    updated: "3d ago",
    folder: "Meetings",
    tags: ["meta"],
    shared: true,
    collaborators: ["u2", "u4", "u1"],
  },
  {
    id: "n9",
    emoji: "✏️",
    title: "Draft — Blog post on presence UX",
    preview: "Why ambient presence beats status dots — a working outline…",
    updated: "4d ago",
    folder: "Design",
    tags: ["research"],
    draft: true,
    collaborators: ["u1", "u3"],
  },
];

export const FOLDERS = [
  { slug: "product", name: "Product" },
  { slug: "design", name: "Design" },
  { slug: "research", name: "Research" },
  { slug: "meetings", name: "Meetings" },
  { slug: "personal", name: "Personal" },
  { slug: "trash", name: "Trash" },
];

export const TAGS = ["launch", "research", "specs", "meta"];

export const folderBySlug = (slug: string) =>
  FOLDERS.find((f) => f.slug === slug.toLowerCase());
