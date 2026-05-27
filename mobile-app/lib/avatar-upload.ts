export type AvatarUploadAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  file?: File | Blob | null;
};

type NativeAvatarUploadPart = {
  uri: string;
  name: string;
  type: string;
};

const DEFAULT_AVATAR_FILE_NAME = 'avatar.jpg';

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const getFileNameFromFile = (file?: File | Blob | null) => {
  if (!file || !('name' in file) || typeof file.name !== 'string') {
    return null;
  }

  return file.name.trim() || null;
};

const getFileNameFromUri = (uri: string) => {
  const cleanUri = uri.split('?')[0]?.split('#')[0] || '';
  const lastSegment = cleanUri.split('/').pop();

  return lastSegment ? decodeURIComponent(lastSegment) : null;
};

const getExtension = (fileName: string) => {
  const match = /\.([a-z0-9]+)$/i.exec(fileName);
  return match?.[1]?.toLowerCase() || null;
};

export const getAvatarUploadFileName = (asset: AvatarUploadAsset) =>
  asset.fileName?.trim() ||
  getFileNameFromFile(asset.file) ||
  getFileNameFromUri(asset.uri) ||
  DEFAULT_AVATAR_FILE_NAME;

export const getAvatarUploadMimeType = (asset: AvatarUploadAsset) => {
  if (asset.mimeType?.trim()) {
    return asset.mimeType.trim();
  }

  if (asset.file?.type) {
    return asset.file.type;
  }

  const extension = getExtension(getAvatarUploadFileName(asset));
  return extension ? MIME_TYPE_BY_EXTENSION[extension] || 'image/jpeg' : 'image/jpeg';
};

export const createAvatarUploadFormDataValue = (
  asset: AvatarUploadAsset,
): File | Blob | NativeAvatarUploadPart => {
  if (asset.file) {
    return asset.file;
  }

  return {
    uri: asset.uri,
    name: getAvatarUploadFileName(asset),
    type: getAvatarUploadMimeType(asset),
  };
};

export const createAvatarUploadFormData = (asset: AvatarUploadAsset) => {
  const formData = new FormData();

  if (asset.file) {
    formData.append('avatar', asset.file, getAvatarUploadFileName(asset));
    return formData;
  }

  formData.append('avatar', createAvatarUploadFormDataValue(asset) as any);
  return formData;
};
