const BASE_IMAGE_URL = process.env.API_URL || 'http://localhost:3000'
export const IMAGE_PATHS = {
  avatar : (filename) => `${BASE_IMAGE_URL}/uploads/avatars/${filename}`,
  logo   : (filename) => `${BASE_IMAGE_URL}/uploads/logos/${filename}`,
}
