import assert from 'node:assert/strict';
import test from 'node:test';

// @ts-ignore Node's test runner imports the source TypeScript file directly.
import { createAvatarUploadFormDataValue, getAvatarUploadFileName, getAvatarUploadMimeType } from './avatar-upload.ts';

test('derives native avatar upload metadata from the picker uri', () => {
  const asset = { uri: 'file:///cache/Profile Photo.PNG' };

  assert.equal(getAvatarUploadFileName(asset), 'Profile Photo.PNG');
  assert.equal(getAvatarUploadMimeType(asset), 'image/png');
  assert.deepEqual(createAvatarUploadFormDataValue(asset), {
    uri: asset.uri,
    name: 'Profile Photo.PNG',
    type: 'image/png',
  });
});

test('uses the web file object when the picker provides one', () => {
  const file = new File(['avatar'], 'web-avatar.webp', { type: 'image/webp' });
  const asset = { uri: 'blob:http://localhost:8081/avatar', file };

  assert.equal(getAvatarUploadFileName(asset), 'web-avatar.webp');
  assert.equal(getAvatarUploadMimeType(asset), 'image/webp');
  assert.equal(createAvatarUploadFormDataValue(asset), file);
});
