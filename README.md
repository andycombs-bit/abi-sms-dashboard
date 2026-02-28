# Abi SMS Draft Review Dashboard

SMS draft review interface for House to House Lawn Care. Abi (AI agent) generates draft replies to inbound customer texts. This app lets you review, edit, approve, or dismiss those drafts before they're sent.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app loads with mock data by default — no backend needed.

## Configuration

Copy `.env.local.example` to `.env.local` and configure:

- `NEXT_PUBLIC_WEBHOOK_URL` — your n8n webhook base URL
- `NEXT_PUBLIC_USE_MOCK_DATA` — set to `false` to use live webhooks

## API Endpoints (n8n webhooks)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sms-drafts` | GET | Fetch pending drafts |
| `/sms-approve` | POST | Approve & send a draft (`{ draftId, finalText }`) |
| `/sms-dismiss` | POST | Dismiss a draft (`{ draftId }`) |

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Deployed on Vercel
