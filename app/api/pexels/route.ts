import { NextRequest, NextResponse } from 'next/server';

const LOCAL_BROLL_FALLBACKS = [
  ['B04-center-keyword.mp4', '/assets/broll/dark-grid.jpg', 'B-roll local · Centro'],
  ['B05-corner-label.mp4', '/assets/broll/soft-grid.jpg', 'B-roll local · Esquina'],
  ['B06-step.mp4', '/assets/broll/paper-grid.jpg', 'B-roll local · Paso'],
  ['B07-stat.mp4', '/assets/broll/fine-grid.png', 'B-roll local · Estadística'],
  ['B08-callout.mp4', '/assets/broll/confident.png', 'B-roll local · Callout'],
] as const;

const localFallbackResponse = (query: string, reason: string) => NextResponse.json({
  page: 1,
  perPage: LOCAL_BROLL_FALLBACKS.length,
  totalResults: LOCAL_BROLL_FALLBACKS.length,
  fallback: true,
  warning: `Pexels no está disponible para «${query}» (${reason}). Se muestran recursos locales compatibles.`,
  videos: LOCAL_BROLL_FALLBACKS.map(([file, image, author], index) => ({
    id: `zentry-local-${index + 1}`,
    duration: 4,
    image,
    videoUrl: `/zentry-previews/broll/${file}`,
    width: 1080,
    height: 1920,
    author,
    previewPictures: [],
  })),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('query') || 'technology';
  const query = rawQuery.slice(0, 100).trim() || 'technology';
  const pexelsApiKey = process.env.PEXELS_API_KEY?.trim();
  if (!pexelsApiKey) {
    return localFallbackResponse(query, 'clave no configurada');
  }

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '12', 10) || 12));

  try {
    const pexelsUrl = `https://api.pexels.com/v1/videos/search?query=${encodeURIComponent(
      query
    )}&orientation=portrait&locale=es-ES&per_page=${perPage}&page=${page}`;

    const response = await fetch(pexelsUrl, {
      headers: {
        Authorization: pexelsApiKey,
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.warn(`Pexels API respondió ${response.status}; se usa la biblioteca local.`);
      const reason = response.status === 401 || response.status === 403
        ? 'clave rechazada por Pexels'
        : response.status === 429 ? 'límite de solicitudes alcanzado' : `HTTP ${response.status}`;
      return localFallbackResponse(query, reason);
    }

    const data: any = await response.json();

    const formattedVideos = (data.videos || []).map((v: any) => {
      const files = v.video_files || [];
      // Prefer HD 1080x1920 or 720x1280
      const bestFile =
        files.find((f: any) => f.width === 1080 && f.height === 1920) ||
        files.find((f: any) => f.quality === 'hd' && f.width <= f.height) ||
        files.find((f: any) => f.width <= f.height) ||
        files[0];

      return {
        id: v.id,
        duration: v.duration,
        image: v.image,
        videoUrl: bestFile?.link || '',
        width: bestFile?.width || v.width,
        height: bestFile?.height || v.height,
        author: v.user?.name || 'Pexels Creator',
        previewPictures: (v.video_pictures || []).slice(0, 4).map((p: any) => p.picture),
      };
    });

    return NextResponse.json({
      page: data.page || page,
      perPage: data.per_page || perPage,
      totalResults: data.total_results || 0,
      videos: formattedVideos,
    });
  } catch (error: any) {
    console.warn('Pexels no respondió; se usa la biblioteca local:', error?.message || error);
    return localFallbackResponse(query, error?.name === 'TimeoutError' || error?.name === 'AbortError'
      ? 'tiempo de conexión agotado' : 'el servidor no pudo conectar');
  }
}
