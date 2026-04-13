import { NextRequest, NextResponse } from 'next/server';

const QUO_API_KEY = process.env.QUO_API_KEY || '';
const CUSTOMER_LINE_PHONE_NUMBER_ID = 'PNulE9S8jF';

interface QuoMessage {
  id: string;
  body: string;
  direction: 'incoming' | 'outgoing';
  createdAt: string;
  from: string;
  to: string[];
}

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: 'phone parameter required' }, { status: 400 });
  }

  if (!QUO_API_KEY) {
    return NextResponse.json({ error: 'QUO_API_KEY not configured' }, { status: 500 });
  }

  // Normalize phone to E.164
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '1' + cleanPhone;
  const encodedPhone = '%2B' + cleanPhone;

  const url = `https://api.openphone.com/v1/messages?phoneNumberId=${CUSTOMER_LINE_PHONE_NUMBER_ID}&participants[]=${encodedPhone}&maxResults=20`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: QUO_API_KEY },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Quo API returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const messages: QuoMessage[] = data.data || [];

    // Filter to last 48 hours, max 10 messages
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const recent = messages
      .filter((m) => new Date(m.createdAt).getTime() > cutoff)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-10);

    const thread = recent.map((m) => ({
      direction: m.direction,
      text: m.body || '',
      timestamp: m.createdAt,
    }));

    return NextResponse.json(thread);
  } catch (err) {
    console.error('Failed to fetch thread from Quo:', err);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}
