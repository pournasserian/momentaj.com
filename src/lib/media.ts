import fs from 'fs';
import path from 'path';

/**
 * Media file types supported by the CMS
 */
export type MediaType = 'image' | 'video' | 'document' | 'audio';

/**
 * Media file information
 */
export interface MediaFile {
  name: string;
  path: string;
  url: string;
  type: MediaType;
  mimeType: string;
  size: number;
  extension: string;
  createdAt: Date;
  modifiedAt: Date;
}

/**
 * Media folder configuration
 */
export interface MediaFolder {
  name: string;
  path: string;
  relativePath: string;
  files: MediaFile[];
  subfolders: MediaFolder[];
}

// Base directories
const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const MEDIA_BASE = path.join(PUBLIC_DIR, 'media');

/**
 * Image file extensions
 */
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];

/**
 * Video file extensions
 */
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];

/**
 * Document file extensions
 */
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md'];

/**
 * Audio file extensions
 */
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];

/**
 * Get media folder path
 * @param folder - Optional subfolder within media directory
 * @returns Full path to media folder
 */
export function getMediaFolder(folder?: string): string {
  const mediaPath = folder ? path.join(MEDIA_BASE, folder) : MEDIA_BASE;
  
  if (!fs.existsSync(mediaPath)) {
    fs.mkdirSync(mediaPath, { recursive: true });
  }
  
  return mediaPath;
}

/**
 * Determine media type from file extension
 * @param extension - File extension (with or without dot)
 * @returns Media type
 */
export function getMediaType(extension: string): MediaType {
  const ext = extension.toLowerCase().startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
  
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  if (DOCUMENT_EXTENSIONS.includes(ext)) return 'document';
  if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
  
  return 'document';
}

/**
 * Get MIME type from extension
 * @param extension - File extension
 * @returns MIME type string
 */
export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase().startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
  
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.mov': 'video/quicktime',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * List all files in a media folder
 * @param folder - Relative folder path within media directory
 * @returns Array of media files
 */
export function listMediaFiles(folder?: string): MediaFile[] {
  const folderPath = getMediaFolder(folder);
  const files: MediaFile[] = [];
  
  if (!fs.existsSync(folderPath)) {
    return files;
  }
  
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isFile()) {
      const filePath = path.join(folderPath, entry.name);
      const stats = fs.statSync(filePath);
      const extension = path.extname(entry.name);
      
      files.push({
        name: entry.name,
        path: filePath,
        url: `/media/${folder ? folder + '/' : ''}${entry.name}`,
        type: getMediaType(extension),
        mimeType: getMimeType(extension),
        size: stats.size,
        extension: extension,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      });
    }
  }
  
  return files.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
}

/**
 * List all folders in media directory
 * @param parentFolder - Parent folder to list subfolders from
 * @returns Array of folder names
 */
export function listMediaFolders(parentFolder?: string): string[] {
  const folderPath = getMediaFolder(parentFolder);
  const folders: string[] = [];
  
  if (!fs.existsSync(folderPath)) {
    return folders;
  }
  
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      folders.push(entry.name);
    }
  }
  
  return folders.sort();
}

/**
 * Get media folder structure
 * @param relativePath - Relative path within media directory
 * @returns Media folder with files and subfolders
 */
export function getMediaFolderStructure(relativePath?: string): MediaFolder {
  const folderPath = getMediaFolder(relativePath);
  const name = relativePath ? path.basename(relativePath) : 'media';
  
  const folder: MediaFolder = {
    name,
    path: folderPath,
    relativePath: relativePath || '',
    files: [],
    subfolders: []
  };
  
  if (!fs.existsSync(folderPath)) {
    return folder;
  }
  
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isFile()) {
      const filePath = path.join(folderPath, entry.name);
      const stats = fs.statSync(filePath);
      const extension = path.extname(entry.name);
      
      folder.files.push({
        name: entry.name,
        path: filePath,
        url: `/media/${relativePath ? relativePath + '/' : ''}${entry.name}`,
        type: getMediaType(extension),
        mimeType: getMimeType(extension),
        size: stats.size,
        extension: extension,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      });
    } else if (entry.isDirectory()) {
      const subfolderPath = relativePath 
        ? `${relativePath}/${entry.name}` 
        : entry.name;
      folder.subfolders.push(getMediaFolderStructure(subfolderPath));
    }
  }
  
  // Sort files by modified date
  folder.files.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
  
  // Sort subfolders alphabetically
  folder.subfolders.sort((a, b) => a.name.localeCompare(b.name));
  
  return folder;
}

/**
 * Get file information
 * @param filename - File name
 * @param folder - Folder path within media directory
 * @returns Media file or undefined
 */
export function getMediaFile(filename: string, folder?: string): MediaFile | undefined {
  const files = listMediaFiles(folder);
  return files.find(f => f.name === filename);
}

/**
 * Save a file to media folder
 * @param buffer - File buffer
 * @param filename - File name
 * @param folder - Target folder within media directory
 * @returns Media file information
 */
export function saveMediaFile(buffer: Buffer, filename: string, folder?: string): MediaFile {
  const folderPath = getMediaFolder(folder);
  const filePath = path.join(folderPath, filename);
  
  fs.writeFileSync(filePath, buffer);
  
  const stats = fs.statSync(filePath);
  const extension = path.extname(filename);
  
  return {
    name: filename,
    path: filePath,
    url: `/media/${folder ? folder + '/' : ''}${filename}`,
    type: getMediaType(extension),
    mimeType: getMimeType(extension),
    size: stats.size,
    extension: extension,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime
  };
}

/**
 * Delete a media file
 * @param filename - File name
 * @param folder - Folder path within media directory
 * @returns Whether deletion was successful
 */
export function deleteMediaFile(filename: string, folder?: string): boolean {
  const folderPath = getMediaFolder(folder);
  const filePath = path.join(folderPath, filename);
  
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  fs.unlinkSync(filePath);
  return true;
}

/**
 * Create a new media folder
 * @param folderName - Folder name
 * @param parentFolder - Parent folder path
 * @returns Whether creation was successful
 */
export function createMediaFolder(folderName: string, parentFolder?: string): boolean {
  const parentPath = parentFolder 
    ? path.join(MEDIA_BASE, parentFolder) 
    : MEDIA_BASE;
  
  const newFolderPath = path.join(parentPath, folderName);
  
  if (fs.existsSync(newFolderPath)) {
    return false;
  }
  
  fs.mkdirSync(newFolderPath, { recursive: true });
  return true;
}

/**
 * Delete a media folder
 * @param folderName - Folder name
 * @param parentFolder - Parent folder path
 * @returns Whether deletion was successful
 */
export function deleteMediaFolder(folderName: string, parentFolder?: string): boolean {
  const parentPath = parentFolder 
    ? path.join(MEDIA_BASE, parentFolder) 
    : MEDIA_BASE;
  
  const folderPath = path.join(parentPath, folderName);
  
  if (!fs.existsSync(folderPath)) {
    return false;
  }
  
  fs.rmSync(folderPath, { recursive: true });
  return true;
}

/**
 * Get allowed file types from config
 * @returns Object with arrays of allowed extensions by type
 */
export function getAllowedFileTypes() {
  return {
    images: IMAGE_EXTENSIONS,
    videos: VIDEO_EXTENSIONS,
    documents: DOCUMENT_EXTENSIONS,
    audio: AUDIO_EXTENSIONS,
    all: [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...DOCUMENT_EXTENSIONS, ...AUDIO_EXTENSIONS]
  };
}

/**
 * Check if file type is allowed
 * @param extension - File extension
 * @param allowedTypes - Array of allowed extensions
 * @returns Whether file type is allowed
 */
export function isFileTypeAllowed(extension: string, allowedTypes: string[]): boolean {
  const ext = extension.toLowerCase().startsWith('.') 
    ? extension.toLowerCase() 
    : `.${extension.toLowerCase()}`;
  
  return allowedTypes.includes(ext);
}

/**
 * Format file size to human readable
 * @param bytes - File size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
