import { NextRequest, NextResponse } from 'next/server';

type LoginRequestBody = {
  cellphone?: string;
  password?: string;
};

type BackendLoginResponse = {
  message?: string;
  data?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json({ message: 'Backend URL not configured.' }, { status: 500 });
  }

  let body: LoginRequestBody;
  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body.cellphone || !body.password) {
    return NextResponse.json({ message: 'cellphone and password are required.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendUrl}/security/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cellphone: body.cellphone,
        password: body.password,
      }),
      cache: 'no-store',
    });

    const payload = (await response.json()) as BackendLoginResponse;

    if (!response.ok) {
      return NextResponse.json(
        {
          message: payload?.message ?? 'Login failed in backend service.',
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        data: payload?.data ?? null,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        message: 'Unable to reach backend login service.',
      },
      { status: 502 }
    );
  }
}
