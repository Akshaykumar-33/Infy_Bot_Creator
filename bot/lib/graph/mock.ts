import type {
  CalendarEventDetails,
  EmailMessage,
  TeamsMessageResult,
} from "./types.js";

function isoDaysFromNow(days: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

const MOCK_EVENTS: CalendarEventDetails[] = [
  {
    id: "evt-standup",
    subject: "Engineering standup",
    start: isoDaysFromNow(0, 9, 30),
    end: isoDaysFromNow(0, 9, 45),
    timeZone: "UTC",
    isAllDay: false,
    organizer: { name: "Priya Nair", email: "priya.nair@contoso.com" },
    attendees: [
      {
        name: "Priya Nair",
        email: "priya.nair@contoso.com",
        responseStatus: "organizer",
      },
      {
        name: "You",
        email: "you@contoso.com",
        responseStatus: "accepted",
      },
      {
        name: "Sam Ortiz",
        email: "sam.ortiz@contoso.com",
        responseStatus: "accepted",
      },
    ],
    location: "Teams",
    onlineMeetingUrl: "https://teams.microsoft.com/l/meetup-join/standup",
    bodyPreview: "Daily sync: blockers, today focus, deploy status.",
    showAs: "busy",
    importance: "normal",
    categories: ["Engineering"],
    webLink: "https://outlook.office.com/calendar/item/evt-standup",
  },
  {
    id: "evt-design-review",
    subject: "Infy_bot design review",
    start: isoDaysFromNow(1, 14, 0),
    end: isoDaysFromNow(1, 15, 0),
    timeZone: "UTC",
    isAllDay: false,
    organizer: { name: "Alex Chen", email: "alex.chen@contoso.com" },
    attendees: [
      {
        name: "Alex Chen",
        email: "alex.chen@contoso.com",
        responseStatus: "organizer",
      },
      {
        name: "You",
        email: "you@contoso.com",
        responseStatus: "tentativelyAccepted",
      },
      {
        name: "Jordan Lee",
        email: "jordan.lee@contoso.com",
        responseStatus: "notResponded",
      },
    ],
    location: "Building 3 / Room Atlas",
    onlineMeetingUrl: "https://teams.microsoft.com/l/meetup-join/design-review",
    bodyPreview: "Review orchestrator routing, Graph mock vs live, calendar details UX.",
    showAs: "busy",
    importance: "high",
    categories: ["Product", "Review"],
    webLink: "https://outlook.office.com/calendar/item/evt-design-review",
  },
  {
    id: "evt-customer-sync",
    subject: "Contoso quarterly sync",
    start: isoDaysFromNow(3, 16, 0),
    end: isoDaysFromNow(3, 17, 0),
    timeZone: "UTC",
    isAllDay: false,
    organizer: { name: "You", email: "you@contoso.com" },
    attendees: [
      {
        name: "You",
        email: "you@contoso.com",
        responseStatus: "organizer",
      },
      {
        name: "Morgan Blake",
        email: "morgan.blake@fabrikam.com",
        responseStatus: "accepted",
      },
    ],
    location: "Online",
    onlineMeetingUrl: "https://teams.microsoft.com/l/meetup-join/customer-sync",
    bodyPreview: "Agenda: adoption metrics, open tickets, next-quarter roadmap.",
    showAs: "busy",
    importance: "normal",
    categories: ["Customer"],
    webLink: "https://outlook.office.com/calendar/item/evt-customer-sync",
  },
  {
    id: "evt-offsite",
    subject: "Team offsite planning (all day)",
    start: isoDaysFromNow(7, 0, 0),
    end: isoDaysFromNow(8, 0, 0),
    timeZone: "UTC",
    isAllDay: true,
    organizer: { name: "HR Ops", email: "hr@contoso.com" },
    attendees: [
      {
        name: "HR Ops",
        email: "hr@contoso.com",
        responseStatus: "organizer",
      },
      {
        name: "You",
        email: "you@contoso.com",
        responseStatus: "accepted",
      },
    ],
    location: "Bangalore campus",
    onlineMeetingUrl: null,
    bodyPreview: "All-day planning block for the Q3 offsite agenda.",
    showAs: "oof",
    importance: "low",
    categories: ["Team"],
    webLink: "https://outlook.office.com/calendar/item/evt-offsite",
  },
  {
    id: "evt-1-1",
    subject: "1:1 with manager",
    start: isoDaysFromNow(10, 11, 0),
    end: isoDaysFromNow(10, 11, 30),
    timeZone: "UTC",
    isAllDay: false,
    organizer: { name: "Riley Park", email: "riley.park@contoso.com" },
    attendees: [
      {
        name: "Riley Park",
        email: "riley.park@contoso.com",
        responseStatus: "organizer",
      },
      {
        name: "You",
        email: "you@contoso.com",
        responseStatus: "accepted",
      },
    ],
    location: "Teams",
    onlineMeetingUrl: "https://teams.microsoft.com/l/meetup-join/one-on-one",
    bodyPreview: "Career goals, current projects, feedback.",
    showAs: "busy",
    importance: "normal",
    categories: ["People"],
    webLink: "https://outlook.office.com/calendar/item/evt-1-1",
  },
];

const MOCK_EMAILS: EmailMessage[] = [
  {
    id: "mail-1001",
    subject: "Q2 review agenda",
    from: "alex.chen@contoso.com",
    to: ["you@contoso.com"],
    cc: ["priya.nair@contoso.com"],
    bodyPreview: "Please review the attached agenda before Thursday.",
    body: "Hi,\n\nPlease review the attached agenda before Thursday's Q2 review.\n\nThanks,\nAlex",
    receivedAt: isoDaysFromNow(-1, 8, 15),
    labels: ["inbox", "work"],
    conversationId: "conv-q2",
  },
  {
    id: "mail-1002",
    subject: "Deploy window confirmation",
    from: "sam.ortiz@contoso.com",
    to: ["you@contoso.com", "eng-leads@contoso.com"],
    cc: [],
    bodyPreview: "Confirming Friday 18:00 UTC deploy window.",
    body: "Confirming Friday 18:00 UTC deploy window. Reply if you need a change.",
    receivedAt: isoDaysFromNow(-2, 12, 0),
    labels: ["inbox"],
    conversationId: "conv-deploy",
  },
];

let drafts: Array<{
  id: string;
  to: string[];
  subject: string;
  body: string;
  createdAt: string;
}> = [];

let sent: Array<{
  id: string;
  to: string[];
  subject: string;
  body: string;
  sentAt: string;
}> = [];

let labelsByMail: Record<string, string[]> = Object.fromEntries(
  MOCK_EMAILS.map((m) => [m.id, [...m.labels]]),
);

let teamsPosts: TeamsMessageResult[] = [];
let dynamicEvents: CalendarEventDetails[] = [];
let reminders: Array<{
  id: string;
  eventId: string;
  remindAt: string;
  message: string;
}> = [];

export function mockListUpcomingEvents(options: {
  start?: string;
  end?: string;
}): CalendarEventDetails[] {
  const startMs = options.start ? Date.parse(options.start) : Date.now();
  const endMs = options.end
    ? Date.parse(options.end)
    : startMs + 14 * 24 * 60 * 60 * 1000;

  return [...MOCK_EVENTS, ...dynamicEvents]
    .filter((e) => {
      const s = Date.parse(e.start);
      return s >= startMs && s <= endMs;
    })
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}

export function mockGetEventDetails(eventId: string): CalendarEventDetails | null {
  return (
    [...MOCK_EVENTS, ...dynamicEvents].find((e) => e.id === eventId) ?? null
  );
}

export function mockScheduleEvent(input: {
  subject: string;
  start: string;
  end: string;
  timeZone?: string;
  attendees?: string[];
  location?: string;
  bodyPreview?: string;
  onlineMeetingUrl?: string | null;
}): CalendarEventDetails {
  const event: CalendarEventDetails = {
    id: `evt-mock-${Date.now()}`,
    subject: input.subject,
    start: input.start,
    end: input.end,
    timeZone: input.timeZone || "UTC",
    isAllDay: false,
    organizer: { name: "You", email: "you@contoso.com" },
    attendees: (input.attendees || []).map((email) => ({
      name: email.split("@")[0] || email,
      email,
      responseStatus: "notResponded" as const,
    })),
    location: input.location || "Teams",
    onlineMeetingUrl:
      input.onlineMeetingUrl === undefined
        ? "https://teams.microsoft.com/l/meetup-join/mock"
        : input.onlineMeetingUrl,
    bodyPreview: input.bodyPreview || "",
    showAs: "busy",
    importance: "normal",
    categories: [],
    webLink: `https://outlook.office.com/calendar/item/evt-mock-${Date.now()}`,
  };
  dynamicEvents.push(event);
  return event;
}

export function mockFindFreeSlots(input: {
  start: string;
  end: string;
  durationMinutes: number;
}): Array<{ start: string; end: string }> {
  const durationMs = input.durationMinutes * 60_000;
  const windowStart = Date.parse(input.start);
  const windowEnd = Date.parse(input.end);
  const busy = mockListUpcomingEvents({
    start: input.start,
    end: input.end,
  }).map((e) => ({ start: Date.parse(e.start), end: Date.parse(e.end) }));

  const slots: Array<{ start: string; end: string }> = [];
  let cursor = windowStart;
  while (cursor + durationMs <= windowEnd && slots.length < 5) {
    const slotEnd = cursor + durationMs;
    const overlaps = busy.some((b) => cursor < b.end && slotEnd > b.start);
    if (!overlaps) {
      slots.push({
        start: new Date(cursor).toISOString(),
        end: new Date(slotEnd).toISOString(),
      });
      cursor = slotEnd + 30 * 60_000;
    } else {
      cursor += 30 * 60_000;
    }
  }
  return slots;
}

export function mockRescheduleEvent(input: {
  eventId: string;
  start: string;
  end: string;
}): CalendarEventDetails | null {
  const existing = mockGetEventDetails(input.eventId);
  if (!existing) return null;
  const updated = { ...existing, start: input.start, end: input.end };
  const dynIdx = dynamicEvents.findIndex((e) => e.id === input.eventId);
  if (dynIdx >= 0) {
    dynamicEvents[dynIdx] = updated;
  } else {
    dynamicEvents.push(updated);
  }
  return updated;
}

export function mockSetReminder(input: {
  eventId: string;
  remindAt: string;
  message?: string;
}): { id: string; eventId: string; remindAt: string; message: string } | null {
  if (!mockGetEventDetails(input.eventId)) return null;
  const reminder = {
    id: `rem-${Date.now()}`,
    eventId: input.eventId,
    remindAt: input.remindAt,
    message: input.message || "Upcoming meeting reminder",
  };
  reminders.push(reminder);
  return reminder;
}

export function mockSearchEmail(query: string): EmailMessage[] {
  const q = query.toLowerCase();
  return MOCK_EMAILS.filter(
    (m) =>
      m.subject.toLowerCase().includes(q) ||
      m.body.toLowerCase().includes(q) ||
      m.from.toLowerCase().includes(q),
  ).map((m) => ({ ...m, labels: labelsByMail[m.id] || m.labels }));
}

export function mockGetEmail(id: string): EmailMessage | null {
  const found = MOCK_EMAILS.find((m) => m.id === id);
  if (!found) return null;
  return { ...found, labels: labelsByMail[id] || found.labels };
}

export function mockDraftEmail(input: {
  to: string[];
  subject: string;
  body: string;
}) {
  const draft = {
    id: `draft-${Date.now()}`,
    to: input.to,
    subject: input.subject,
    body: input.body,
    createdAt: new Date().toISOString(),
  };
  drafts.push(draft);
  return draft;
}

export function mockSendEmail(input: {
  to: string[];
  subject: string;
  body: string;
  draftId?: string;
}) {
  const message = {
    id: `sent-${Date.now()}`,
    to: input.to,
    subject: input.subject,
    body: input.body,
    sentAt: new Date().toISOString(),
  };
  sent.push(message);
  if (input.draftId) {
    drafts = drafts.filter((d) => d.id !== input.draftId);
  }
  return message;
}

export function mockLabelEmail(input: { emailId: string; labels: string[] }) {
  const mail = mockGetEmail(input.emailId);
  if (!mail) return null;
  const next = Array.from(new Set([...(labelsByMail[input.emailId] || []), ...input.labels]));
  labelsByMail[input.emailId] = next;
  return { ...mail, labels: next };
}

export function mockReplyEmail(input: {
  emailId: string;
  body: string;
}) {
  const mail = mockGetEmail(input.emailId);
  if (!mail) return null;
  return mockSendEmail({
    to: [mail.from],
    subject: mail.subject.startsWith("Re:") ? mail.subject : `Re: ${mail.subject}`,
    body: input.body,
  });
}

export function mockSummarizeThread(conversationId: string) {
  const messages = MOCK_EMAILS.filter((m) => m.conversationId === conversationId);
  if (messages.length === 0) return null;
  return {
    conversationId,
    messageCount: messages.length,
    participants: Array.from(
      new Set(messages.flatMap((m) => [m.from, ...m.to, ...m.cc])),
    ),
    summary: messages.map((m) => `${m.from}: ${m.bodyPreview}`).join(" | "),
  };
}

export function mockPostMessage(input: {
  channelId: string;
  text: string;
  teamId?: string;
}): TeamsMessageResult {
  const post = {
    id: `msg-${Date.now()}`,
    channelId: input.channelId,
    teamId: input.teamId || null,
    text: input.text,
    createdAt: new Date().toISOString(),
  };
  teamsPosts.push(post);
  return post;
}

export function mockSearchChats(query: string) {
  const q = query.toLowerCase();
  const seeded = [
    {
      id: "chat-1",
      title: "Engineering",
      preview: "Deploy finished successfully",
      lastMessageAt: isoDaysFromNow(-1, 18, 0),
    },
    {
      id: "chat-2",
      title: "Infy_bot",
      preview: "Calendar upcoming events mock ready",
      lastMessageAt: isoDaysFromNow(-1, 11, 30),
    },
  ];
  return seeded.filter(
    (c) =>
      c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q),
  );
}

export function mockCreateMeeting(input: {
  subject: string;
  start: string;
  end: string;
  attendees?: string[];
}) {
  return mockScheduleEvent({
    ...input,
    location: "Microsoft Teams Meeting",
    onlineMeetingUrl: "https://teams.microsoft.com/l/meetup-join/created",
  });
}

export function mockNotifyChannel(input: {
  channelId: string;
  text: string;
  teamId?: string;
}) {
  return mockPostMessage(input);
}
