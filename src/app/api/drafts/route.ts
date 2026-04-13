import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const SHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
const SHEET_NAME = 'SMS Drafts';
// Columns A through O — everything we need. P-AK are leftover junk.
const RANGE = `${SHEET_NAME}!A:O`;

function getAuth() {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS;

  if (!credentialsJson) {
    throw new Error('Missing GOOGLE_SHEETS_CREDENTIALS env var');
  }

  const credentials = JSON.parse(credentialsJson);

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

interface SheetRow {
  draft_id: string;
  customer_name: string;
  phone: string;
  inbound_text: string;
  draft_response: string;
  confidence_score: string;
  reasoning: string;
  action_items: string;
  status: string;
  created_at: string;
}

function parseActionItems(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  // Action items are stored as newline-separated bullets starting with "- "
  return raw
    .split('\n')
    .map((line) => line.replace(/^-\s*/, '').trim())
    .filter(Boolean);
}

function rowToDraft(row: string[], headers: string[]) {
  const get = (col: string) => row[headers.indexOf(col)] || '';

  const r: SheetRow = {
    draft_id: get('draft_id'),
    customer_name: get('customer_name'),
    phone: get('phone'),
    inbound_text: get('inbound_text'),
    draft_response: get('draft_response'),
    confidence_score: get('confidence_score'),
    reasoning: get('reasoning'),
    action_items: get('action_items'),
    status: get('status'),
    created_at: get('created_at'),
  };

  const createdAt = r.created_at || new Date().toISOString();

  return {
    id: r.draft_id,
    customerName: r.customer_name || 'Unknown',
    customerPhone: r.phone,
    confidenceScore: (() => {
      const raw = parseFloat(r.confidence_score);
      if (isNaN(raw)) return 0;
      return raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
    })(),
    messages: [
      {
        id: `${r.draft_id}-inbound`,
        sender: 'customer' as const,
        text: r.inbound_text,
        timestamp: createdAt,
      },
    ],
    draftResponse: r.draft_response,
    internalNotes: {
      reasoning: r.reasoning,
      actionItems: parseActionItems(r.action_items),
    },
    createdAt,
    status: r.status as 'pending' | 'approved' | 'dismissed',
  };
}

export async function GET() {
  try {
    if (!SHEET_ID) {
      return NextResponse.json(
        { error: 'GOOGLE_SHEETS_SHEET_ID not configured' },
        { status: 500 }
      );
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json([]);
    }

    const headers = rows[0];
    const drafts = rows
      .slice(1)
      .filter((row) => {
        const statusIdx = headers.indexOf('status');
        const status = statusIdx >= 0 ? row[statusIdx] : '';
        return status === 'pending' || status === 'needs_human_input';
      })
      .map((row) => rowToDraft(row, headers));

    return NextResponse.json(drafts);
  } catch (err) {
    console.error('Failed to fetch drafts from Google Sheets:', err);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}
