import mongoose from "mongoose";

const CollaboratorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  colorVar: { type: String, required: true },
  initials: { type: String, required: true },
  status: { type: String, enum: ["editing", "viewing", "idle"], default: "idle" },
});

const CommentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userName: { type: String, required: true },
  userInitials: { type: String, required: true },
  userColor: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const NoteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  emoji: { type: String, default: "📝" },
  title: { type: String, default: "Untitled" },
  preview: { type: String, default: "" },
  content: { type: String, default: "" },
  updated: { type: Date, default: Date.now },
  starred: { type: Boolean, default: false },
  folder: { type: String, default: "Personal" },
  tags: { type: [String], default: [] },
  shared: { type: Boolean, default: false },
  draft: { type: Boolean, default: true },
  collaborators: { type: [String], default: ["u1"] }, // IDs of collaborators
  comments: { type: [CommentSchema], default: [] },
});

// Update the preview and updated fields automatically on save if content is updated
NoteSchema.pre("save", function (next) {
  this.updated = new Date();
  if (this.isModified("content") && this.content) {
    // Generate a simple preview from content (e.g. first 80 characters, strip md headers)
    const cleanContent = this.content
      .replace(/[#*`_>]/g, "") // remove simple markdown chars
      .replace(/\s+/g, " ")
      .trim();
    this.preview = cleanContent.slice(0, 80) + (cleanContent.length > 80 ? "…" : "");
  }
  next();
});

export const Collaborator = mongoose.model("Collaborator", CollaboratorSchema);
export const Note = mongoose.model("Note", NoteSchema);
