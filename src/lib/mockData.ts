import { Draft } from './types';

export const mockDrafts: Draft[] = [
  {
    id: 'draft-001',
    customerName: 'Maria Gonzalez',
    customerPhone: '(512) 555-0142',
    confidenceScore: 72,
    messages: [
      {
        id: 'msg-001a',
        sender: 'customer',
        text: "Hi, I noticed my yard wasn't mowed this week. We're on the biweekly plan and it was supposed to be done yesterday. Can you let me know what happened?",
        timestamp: '2026-02-28T09:15:00Z',
      },
    ],
    draftResponse:
      "Hi Maria! I'm so sorry about that — it looks like your crew was rerouted due to weather delays earlier this week. We've got you on the schedule for tomorrow morning. You should be all set by noon. Sorry again for the inconvenience!",
    internalNotes: {
      reasoning:
        'Customer is on biweekly W1 schedule. Crew 4 was delayed Tuesday due to rain. Service was pushed to Friday. Confidence moderate because I could not verify the exact reschedule in WS — assuming standard rain delay protocol.',
      actionItems: [
        'Verify reschedule date in WorkSchedule360',
        'Confirm Crew 4 has this address on Friday route',
        'Flag if not rescheduled — escalate to Cole',
      ],
    },
    createdAt: '2026-02-28T09:18:00Z',
    status: 'pending',
  },
  {
    id: 'draft-002',
    customerName: 'James Whitfield',
    customerPhone: '(512) 555-0287',
    confidenceScore: 95,
    messages: [
      {
        id: 'msg-002a',
        sender: 'customer',
        text: "Hey there, I just moved to the Avery Ranch area and I'm looking for a lawn service. What are your rates for a standard weekly mow? My yard is about 5,000 sq ft.",
        timestamp: '2026-02-28T08:42:00Z',
      },
    ],
    draftResponse:
      "Hi James! Welcome to the neighborhood! We'd love to help keep your yard looking great. For a 5,000 sq ft yard in Avery Ranch, our weekly mowing service runs $40/visit. That includes mowing, edging, and blowing. Want me to get you set up? We can usually start within a week!",
    internalNotes: {
      reasoning:
        'New customer inquiry. Avery Ranch is in our service area (78717). Standard pricing for ~5,000 sq ft is $40/week. High confidence — straightforward pricing inquiry with no special circumstances.',
      actionItems: [
        'If approved, send new customer intake form',
        'Add to CRM pipeline in Zoho',
        'Check crew capacity for 78717 zone',
      ],
    },
    createdAt: '2026-02-28T08:45:00Z',
    status: 'pending',
  },
  {
    id: 'draft-003',
    customerName: 'Patricia Chen',
    customerPhone: '(512) 555-0391',
    confidenceScore: 88,
    messages: [
      {
        id: 'msg-003a',
        sender: 'customer',
        text: "I haven't received my invoice for February yet. Can you check on that? I usually get it by the 15th. My account number is H2H-1847.",
        timestamp: '2026-02-28T10:05:00Z',
      },
    ],
    draftResponse:
      "Hi Patricia! Thanks for reaching out. Let me look into your February invoice — I'll check with our billing team and make sure it gets sent over to you today. Sorry for the delay!",
    internalNotes: {
      reasoning:
        'Billing inquiry — customer expects invoice by the 15th. Account H2H-1847. Need to verify in QuickBooks whether February invoice was generated. Confidence is good but not 95+ because I cannot directly confirm the invoice status.',
      actionItems: [
        'Check QuickBooks for invoice status on account H2H-1847',
        'If not generated, flag to Cole for manual send',
        'Verify customer email on file is current',
      ],
    },
    createdAt: '2026-02-28T10:08:00Z',
    status: 'pending',
  },
  {
    id: 'draft-004',
    customerName: 'Robert Dawson',
    customerPhone: '(512) 555-0518',
    confidenceScore: 91,
    messages: [
      {
        id: 'msg-004a',
        sender: 'customer',
        text: 'Can I switch from biweekly to weekly starting in March? The grass is really starting to grow fast with all this rain.',
        timestamp: '2026-02-28T07:30:00Z',
      },
    ],
    draftResponse:
      "Hi Robert! Absolutely, we can switch you to weekly starting in March. With spring kicking in, that's a great call — your yard will look so much better with weekly cuts. I'll get that updated for you. Your new rate will be $45/visit on the weekly plan. Sound good?",
    internalNotes: {
      reasoning:
        'Schedule change request — biweekly to weekly. This is a common spring request. Customer is in the system on W1 biweekly. Standard weekly rate for his lot size is $45. High confidence — straightforward upgrade.',
      actionItems: [
        'Update schedule in WorkSchedule360 from biweekly to weekly',
        'Update Zoho W1 app with new frequency',
        'Adjust billing in QuickBooks to weekly rate ($45)',
      ],
    },
    createdAt: '2026-02-28T07:33:00Z',
    status: 'pending',
  },
  {
    id: 'draft-005',
    customerName: 'Angela Morrison',
    customerPhone: '(512) 555-0674',
    confidenceScore: 55,
    messages: [
      {
        id: 'msg-005a',
        sender: 'customer',
        text: "I need to talk to someone about the crew that came out yesterday. They ran over my flower bed with the mower and didn't even clean it up. This is the second time this has happened. I'm really upset and considering canceling.",
        timestamp: '2026-02-28T11:20:00Z',
      },
    ],
    draftResponse:
      "Hi Angela, I'm really sorry to hear about your flower bed — that's absolutely not the level of care we aim for, especially since this has happened before. I'm going to flag this to our operations manager right away so we can address it with the crew directly. We'd also like to send someone out to help clean up and assess any damage. Can we schedule a time for that this week? We truly value you as a customer and want to make this right.",
    internalNotes: {
      reasoning:
        'Complaint — repeat issue with crew damaging flower bed. Customer is at risk of canceling. This is a sensitive situation requiring careful handling. Low confidence because the response needs human judgment on the right remedy (credit, free service, crew reassignment, etc.).',
      actionItems: [
        'URGENT: Escalate to Cole immediately',
        'Identify which crew serviced this address yesterday',
        'Document incident for crew performance review',
        'Consider offering service credit or free remediation visit',
        'Update customer notes in Zoho with complaint history',
      ],
    },
    createdAt: '2026-02-28T11:23:00Z',
    status: 'pending',
  },
  {
    id: 'draft-006',
    customerName: 'David Park',
    customerPhone: '(512) 555-0823',
    confidenceScore: 97,
    messages: [
      {
        id: 'msg-006a',
        sender: 'customer',
        text: 'Just wanted to say thanks — the yard looks amazing after yesterday. Your crew always does a great job. Really appreciate it!',
        timestamp: '2026-02-28T06:50:00Z',
      },
    ],
    draftResponse:
      "Thanks so much, David! That really means a lot — I'll make sure to pass your kind words along to the crew. They take a lot of pride in their work, and hearing this will make their day. We appreciate you! 🌿",
    internalNotes: {
      reasoning:
        'Positive feedback — straightforward thank-you response. Very high confidence. No action items beyond passing along the compliment.',
      actionItems: [
        'Forward compliment to crew lead',
        'Log positive feedback in customer notes',
      ],
    },
    createdAt: '2026-02-28T06:53:00Z',
    status: 'pending',
  },
];
