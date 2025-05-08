import mongoose, { Schema, Document } from 'mongoose';

// Version history interface for tracking content changes
export interface IVersionHistoryItem {
  version: number;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  changes: string;
  content: string;
  projectInstructions?: string;
}

// Interface for the content storage format
export interface IContentFormat {
  raw: string;         // Original Markdown or HTML content
  html?: string;       // Rendered HTML (for caching)
  format: 'markdown' | 'html';  // Format type
  lastRenderedAt?: Date; // When the content was last rendered (for caching)
}

// Define the Lesson interface
export interface ILesson extends Document {
  title: string;
  slug: string;
  sectionId: mongoose.Types.ObjectId;
  order: number;
  estimatedMinutes: number;
  content: string | IContentFormat;  // Support both string and structured content
  renderedContent?: string;  // Cached rendered HTML (legacy field)
  projectInstructions?: string | IContentFormat; // Legacy field
  renderedProjectInstructions?: string;  // Cached rendered HTML for project (legacy field)
  lastRenderedAt?: Date; // When the content was last rendered
}

// Define the schema
const LessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section ID is required'],
    index: true
  },
  order: {
    type: Number,
    default: 1
  },
  estimatedMinutes: {
    type: Number,
    default: 30
  },
  content: {
    type: Schema.Types.Mixed, // Can be string or content format object
    required: [true, 'Content is required']
  },
  renderedContent: String, // For backward compatibility
  projectInstructions: Schema.Types.Mixed, // Legacy field
  renderedProjectInstructions: String, // For backward compatibility
  lastRenderedAt: Date
}, 
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: false, // Disabling timestamps removes createdAt and updatedAt
  versionKey: false // Removes __v version key 
});

// Compound index for SectionId + Slug to enforce uniqueness
LessonSchema.index({ sectionId: 1, slug: 1 }, { unique: true });

// Export the model
export default mongoose.model<ILesson>('Lesson', LessonSchema);