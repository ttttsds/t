/**
 * Utility functions for converting MongoDB documents to clean DTOs (Data Transfer Objects)
 */

/**
 * Removes internal/system fields from a path object before sending to client
 */
export const cleanPathDTO = (path: any) => {
  if (!path) return null;
  
  // Create a new object with only the fields we want to expose
  const cleanPath = {
    _id: path._id,
    title: path.title,
    slug: path.slug,
    description: path.description,
    imageUrl: path.imageUrl,
    estimatedHours: path.estimatedHours,
    // Remove the published field completely
    // Add any other fields that should be exposed to the client
  };
  
  return cleanPath;
};

/**
 * Removes internal/system fields from a section object before sending to client
 */
export const cleanSectionDTO = (section: any) => {
  if (!section) return null;
  
  const cleanSection = {
    _id: section._id,
    title: section.title,
    slug: section.slug,
    description: section.description,
    estimatedHours: section.estimatedHours,
    order: section.order,
    pathId: section.pathId
  };
  
  return cleanSection;
};

/**
 * Removes internal/system fields from a lesson object before sending to client
 */
export const cleanLessonDTO = (lesson: any) => {
  if (!lesson) return null;
  
  const cleanLesson = {
    _id: lesson._id,
    title: lesson.title,
    slug: lesson.slug,
    estimatedMinutes: lesson.estimatedMinutes,
    order: lesson.order,
    content: lesson.content,
    sectionId: lesson.sectionId,
    // Fields removed: projectInstructions, isPublished, hasProject, createdBy, updatedBy, version, 
    // versionHistory, createdAt, updatedAt, __v, lastRenderedAt
  };
  
  return cleanLesson;
};

/**
 * Maps an array of documents to their DTO representation
 */
export const mapToDTO = <T>(items: any[], mapperFn: (item: any) => T): T[] => {
  if (!items || !Array.isArray(items)) return [];
  return items.map(mapperFn);
}; 