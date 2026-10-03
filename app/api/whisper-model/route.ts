import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model') || 'base';

  const validModels = ['tiny', 'base', 'small'];
  if (!validModels.includes(model)) {
    return new NextResponse('Modelo inválido', { status: 400 });
  }

  const hfUrl = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`;

  try {
    const upstream = await fetch(hfUrl, {
      headers: {
        'User-Agent': 'Zentry-Video-Editor/1.0',
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new NextResponse(`Error al obtener modelo de HuggingFace: ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Length', upstream.headers.get('content-length') || '');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return new NextResponse(`Error interno en proxy de modelo: ${error.message}`, { status: 500 });
  }
}
