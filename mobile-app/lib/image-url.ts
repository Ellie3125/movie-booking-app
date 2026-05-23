export type PosterSource =
  | string
  | null
  | undefined
  | {
      posterUrl?: string | null;
      poster_path?: string | null;
      posterPath?: string | null;
      poster?: string | null;
    };

type NormalizePosterOptions = {
  backendApiBaseUrl?: string | null;
  tmdbImageBaseUrl?: string | null;
};

const DEFAULT_TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const trimLeadingSlashes = (value: string) => value.replace(/^\/+/, '');

const getConfiguredTmdbBaseUrl = (override?: string | null) =>
  trimTrailingSlashes(
    override?.trim() ||
      process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE_URL?.trim() ||
      DEFAULT_TMDB_IMAGE_BASE_URL,
  );

const getBackendAssetOrigin = (backendApiBaseUrl?: string | null) => {
  const configuredBaseUrl = backendApiBaseUrl?.trim() || process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const match = configuredBaseUrl?.match(/^(https?:\/\/[^/]+)/i);

  return match?.[1]?.replace(/\/$/, '') || '';
};

export const getMoviePosterPath = (source: PosterSource) => {
  if (typeof source === 'string') {
    return source.trim() || null;
  }

  if (!source) {
    return null;
  }

  const candidates = [
    source.posterUrl,
    source.poster_path,
    source.posterPath,
    source.poster,
  ];

  return candidates
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value)) || null;
};

export const normalizePosterUrl = (
  source: PosterSource,
  options: NormalizePosterOptions = {},
) => {
  const posterPath = getMoviePosterPath(source);

  if (!posterPath) {
    return null;
  }

  if (/^https?:\/\//i.test(posterPath)) {
    return posterPath;
  }

  if (posterPath.startsWith('//')) {
    return `https:${posterPath}`;
  }

  const normalizedPath = trimLeadingSlashes(posterPath);

  if (normalizedPath.startsWith('uploads/')) {
    const backendOrigin = getBackendAssetOrigin(options.backendApiBaseUrl);
    return backendOrigin ? `${backendOrigin}/${normalizedPath}` : `/${normalizedPath}`;
  }

  return `${getConfiguredTmdbBaseUrl(options.tmdbImageBaseUrl)}/${normalizedPath}`;
};
