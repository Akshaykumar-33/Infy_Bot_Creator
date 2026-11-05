import { getGraphAccessToken, getGraphAuthConfig, isGraphConfigured } from "./auth.js";
import * as mock from "./mock.js";
import type {
  CalendarEventDetails,
  EmailMessage,
  GraphMode,
  ToolResultBase,
} from "./types.js";

export function graphMode(): GraphMode {
  return isGraphConfigured() ? "live" : "mock";
}

function okBase(): ToolResultBase {
  return { ok: true, mode: graphMode() };
}

function errBase(error: string): ToolResultBase {
  return { ok: false, mode: graphMode(), error };
}

async function graphFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getGraphAccessToken();
  const config = getGraphAuthConfig();
  if (!config) throw new Error("Microsoft Graph is not configured");

  const url = path.startsWith("http")
    ? path
    : `https://graph.microsoft.com/v1.0${path}`;

  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
}

function userPath(suffix: string): string {
  const config = getGraphAuthConfig();
  const user = config?.userId || "me";
  return `/users/${encodeURIComponent(user)}${suffix}`;
}

function mapGraphEvent(raw: Record<string, unknown>): CalendarEventDetails {
  const organizer = (raw.organizer as { emailAddress?: { name?: string; address?: string } })
    ?.emailAddress;
  const attendeesRaw = (raw.attendees as Array<{
    type?: string;
    status?: { response?: string };
    emailAddress?: { name?: string; address?: string };
  }>) || [];
  const online = raw.onlineMeeting as { joinUrl?: string } | null;
  const start = raw.start as { dateTime?: string; timeZone?: string };
  const end = raw.end as { dateTime?: string; timeZone?: string };
  const loc = raw.location as { displayName?: string } | undefined;

  return {
    id: String(raw.id || ""),
    subject: String(raw.subject || "(no subject)"),
    start: start?.dateTime ? new Date(start.dateTime).toISOString() : "",
    end: end?.dateTime ? new Date(end.dateTime).toISOString() : "",
    timeZone: start?.timeZone || "UTC",
    isAllDay: Boolean(raw.isAllDay),
    organizer: {
      name: organizer?.name || "",
      email: organizer?.address || "",
    },
    attendees: attendeesRaw.map((a) => ({
      name: a.emailAddress?.name || "",
      email: a.emailAddress?.address || "",
      responseStatus: (a.status?.response || "none") as CalendarEventDetails["attendees"][number]["responseStatus"],
    })),
    location: loc?.displayName || "",
    onlineMeetingUrl: online?.joinUrl || (raw.onlineMeetingUrl as string) || null,
    bodyPreview: String(raw.bodyPreview || ""),
    showAs: (String(raw.showAs || "unknown") as CalendarEventDetails["showAs"]),
    importance: (String(raw.importance || "normal") as CalendarEventDetails["importance"]),
    categories: Array.isArray(raw.categories)
      ? (raw.categories as string[])
      : [],
    webLink: String(raw.webLink || ""),
  };
}

export async function listUpcomingEvents(input: {
  start?: string;
  end?: string;
  top?: number;
}): Promise<
  ToolResultBase & {
    events: CalendarEventDetails[];
    window: { start: string; end: string };
  }
> {
  const start = input.start || new Date().toISOString();
  const end =
    input.end ||
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const top = input.top ?? 50;

  if (!isGraphConfigured()) {
    return {
      ...okBase(),
      window: { start, end },
      events: mock.mockListUpcomingEvents({ start, end }).slice(0, top),
    };
  }

  try {
    const params = new URLSearchParams({
      startDateTime: start,
      endDateTime: end,
      $orderby: "start/dateTime",
      $top: String(top),
      $select:
        "id,subject,start,end,isAllDay,organizer,attendees,location,onlineMeeting,onlineMeetingUrl,bodyPreview,showAs,importance,categories,webLink",
    });
    const res = await graphFetch(
      `${userPath("/calendarView")}?${params.toString()}`,
    );
    if (!res.ok) {
      return {
        ...errBase(`Graph calendarView failed (${res.status}): ${await res.text()}`),
        window: { start, end },
        events: [],
      };
    }
    const json = (await res.json()) as { value?: Record<string, unknown>[] };
    return {
      ...okBase(),
      window: { start, end },
      events: (json.value || []).map(mapGraphEvent),
    };
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      window: { start, end },
      events: [],
    };
  }
}

export async function getEventDetails(eventId: string): Promise<
  ToolResultBase & { event: CalendarEventDetails | null }
> {
  if (!isGraphConfigured()) {
    const event = mock.mockGetEventDetails(eventId);
    return event
      ? { ...okBase(), event }
      : { ...errBase(`Event not found: ${eventId}`), event: null };
  }

  try {
    const res = await graphFetch(
      `${userPath(`/events/${encodeURIComponent(eventId)}`)}?$select=id,subject,start,end,isAllDay,organizer,attendees,location,onlineMeeting,onlineMeetingUrl,bodyPreview,showAs,importance,categories,webLink`,
    );
    if (!res.ok) {
      return {
        ...errBase(`Graph get event failed (${res.status}): ${await res.text()}`),
        event: null,
      };
    }
    const json = (await res.json()) as Record<string, unknown>;
    return { ...okBase(), event: mapGraphEvent(json) };
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      event: null,
    };
  }
}

export async function scheduleEvent(input: {
  subject: string;
  start: string;
  end: string;
  timeZone?: string;
  attendees?: string[];
  location?: string;
  bodyPreview?: string;
}): Promise<ToolResultBase & { event: CalendarEventDetails | null }> {
  if (!isGraphConfigured()) {
    return { ...okBase(), event: mock.mockScheduleEvent(input) };
  }

  try {
    const tz = input.timeZone || "UTC";
    const body = {
      subject: input.subject,
      body: {
        contentType: "Text",
        content: input.bodyPreview || "",
      },
      start: { dateTime: input.start.replace(/\.\d{3}Z$/, ""), timeZone: tz },
      end: { dateTime: input.end.replace(/\.\d{3}Z$/, ""), timeZone: tz },
      location: input.location ? { displayName: input.location } : undefined,
      attendees: (input.attendees || []).map((address) => ({
        emailAddress: { address },
        type: "required",
      })),
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness",
    };
    const res = await graphFetch(userPath("/events"), {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return {
        ...errBase(`Graph create event failed (${res.status}): ${await res.text()}`),
        event: null,
      };
    }
    const json = (await res.json()) as Record<string, unknown>;
    return { ...okBase(), event: mapGraphEvent(json) };
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      event: null,
    };
  }
}

export async function findFreeSlots(input: {
  start: string;
  end: string;
  durationMinutes: number;
}): Promise<
  ToolResultBase & { slots: Array<{ start: string; end: string }> }
> {
  if (!isGraphConfigured()) {
    return { ...okBase(), slots: mock.mockFindFreeSlots(input) };
  }

  // Live mode: derive free slots from calendarView busy blocks.
  const upcoming = await listUpcomingEvents({
    start: input.start,
    end: input.end,
    top: 100,
  });
  if (!upcoming.ok) {
    return { ...errBase(upcoming.error || "Failed to load calendar"), slots: [] };
  }

  const durationMs = input.durationMinutes * 60_000;
  const windowStart = Date.parse(input.start);
  const windowEnd = Date.parse(input.end);
  const busy = upcoming.events.map((e) => ({
    start: Date.parse(e.start),
    end: Date.parse(e.end),
  }));
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
  return { ...okBase(), slots };
}

export async function rescheduleEvent(input: {
  eventId: string;
  start: string;
  end: string;
  timeZone?: string;
}): Promise<ToolResultBase & { event: CalendarEventDetails | null }> {
  if (!isGraphConfigured()) {
    const event = mock.mockRescheduleEvent(input);
    return event
      ? { ...okBase(), event }
      : { ...errBase(`Event not found: ${input.eventId}`), event: null };
  }

  try {
    const tz = input.timeZone || "UTC";
    const res = await graphFetch(
      userPath(`/events/${encodeURIComponent(input.eventId)}`),
      {
        method: "PATCH",
        body: JSON.stringify({
          start: {
            dateTime: input.start.replace(/\.\d{3}Z$/, ""),
            timeZone: tz,
          },
          end: {
            dateTime: input.end.replace(/\.\d{3}Z$/, ""),
            timeZone: tz,
          },
        }),
      },
    );
    if (!res.ok) {
      return {
        ...errBase(`Graph reschedule failed (${res.status}): ${await res.text()}`),
        event: null,
      };
    }
    return getEventDetails(input.eventId);
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      event: null,
    };
  }
}

export async function setReminder(input: {
  eventId: string;
  remindAt: string;
  message?: string;
}): Promise<
  ToolResultBase & {
    reminder: {
      id: string;
      eventId: string;
      remindAt: string;
      message: string;
    } | null;
  }
> {
  if (!isGraphConfigured()) {
    const reminder = mock.mockSetReminder(input);
    return reminder
      ? { ...okBase(), reminder }
      : { ...errBase(`Event not found: ${input.eventId}`), reminder: null };
  }

  // Graph has reminderMinutesBeforeStart on events; map remindAt to minutes.
  try {
    const details = await getEventDetails(input.eventId);
    if (!details.event) {
      return { ...errBase(details.error || "Event not found"), reminder: null };
    }
    const minutes = Math.max(
      0,
      Math.round(
        (Date.parse(details.event.start) - Date.parse(input.remindAt)) / 60_000,
      ),
    );
    const res = await graphFetch(
      userPath(`/events/${encodeURIComponent(input.eventId)}`),
      {
        method: "PATCH",
        body: JSON.stringify({
          isReminderOn: true,
          reminderMinutesBeforeStart: minutes,
        }),
      },
    );
    if (!res.ok) {
      return {
        ...errBase(`Graph set reminder failed (${res.status}): ${await res.text()}`),
        reminder: null,
      };
    }
    return {
      ...okBase(),
      reminder: {
        id: `graph-rem-${input.eventId}`,
        eventId: input.eventId,
        remindAt: input.remindAt,
        message: input.message || "Upcoming meeting reminder",
      },
    };
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      reminder: null,
    };
  }
}

export async function draftEmail(input: {
  to: string[];
  subject: string;
  body: string;
}) {
  if (!isGraphConfigured()) {
    return { ...okBase(), draft: mock.mockDraftEmail(input) };
  }
  try {
    const res = await graphFetch(userPath("/messages"), {
      method: "POST",
      body: JSON.stringify({
        subject: input.subject,
        body: { contentType: "Text", content: input.body },
        toRecipients: input.to.map((address) => ({
          emailAddress: { address },
        })),
      }),
    });
    if (!res.ok) {
      return {
        ...errBase(`Graph draft failed (${res.status}): ${await res.text()}`),
        draft: null,
      };
    }
    const json = (await res.json()) as { id?: string };
    return {
      ...okBase(),
      draft: {
        id: json.id || "",
        to: input.to,
        subject: input.subject,
        body: input.body,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      draft: null,
    };
  }
}

export async function sendEmail(input: {
  to: string[];
  subject: string;
  body: string;
  draftId?: string;
}) {
  if (!isGraphConfigured()) {
    return { ...okBase(), message: mock.mockSendEmail(input) };
  }
  try {
    if (input.draftId) {
      const res = await graphFetch(
        userPath(`/messages/${encodeURIComponent(input.draftId)}/send`),
        { method: "POST", body: "{}" },
      );
      if (!res.ok) {
        return {
          ...errBase(`Graph send draft failed (${res.status}): ${await res.text()}`),
          message: null,
        };
      }
      return {
        ...okBase(),
        message: {
          id: input.draftId,
          to: input.to,
          subject: input.subject,
          body: input.body,
          sentAt: new Date().toISOString(),
        },
      };
    }

    const res = await graphFetch(userPath("/sendMail"), {
      method: "POST",
      body: JSON.stringify({
        message: {
          subject: input.subject,
          body: { contentType: "Text", content: input.body },
          toRecipients: input.to.map((address) => ({
            emailAddress: { address },
          })),
        },
        saveToSentItems: true,
      }),
    });
    if (!res.ok) {
      return {
        ...errBase(`Graph sendMail failed (${res.status}): ${await res.text()}`),
        message: null,
      };
    }
    return {
      ...okBase(),
      message: {
        id: `sent-${Date.now()}`,
        to: input.to,
        subject: input.subject,
        body: input.body,
        sentAt: new Date().toISOString(),
      },
    };
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      message: null,
    };
  }
}

export async function searchEmail(query: string): Promise<
  ToolResultBase & { messages: EmailMessage[] }
> {
  if (!isGraphConfigured()) {
    return { ...okBase(), messages: mock.mockSearchEmail(query) };
  }
  try {
    const params = new URLSearchParams({
      $search: `"${query.replace(/"/g, "")}"`,
      $top: "20",
    });
    const res = await graphFetch(`${userPath("/messages")}?${params}`);
    if (!res.ok) {
      return {
        ...errBase(`Graph search mail failed (${res.status}): ${await res.text()}`),
        messages: [],
      };
    }
    const json = (await res.json()) as {
      value?: Array<Record<string, unknown>>;
    };
    const messages: EmailMessage[] = (json.value || []).map((m) => {
      const from = m.from as { emailAddress?: { address?: string } };
      const to = (m.toRecipients as Array<{ emailAddress?: { address?: string } }>) || [];
      const cc = (m.ccRecipients as Array<{ emailAddress?: { address?: string } }>) || [];
      return {
        id: String(m.id || ""),
        subject: String(m.subject || ""),
        from: from?.emailAddress?.address || "",
        to: to.map((r) => r.emailAddress?.address || "").filter(Boolean),
        cc: cc.map((r) => r.emailAddress?.address || "").filter(Boolean),
        bodyPreview: String(m.bodyPreview || ""),
        body: String((m.body as { content?: string })?.content || m.bodyPreview || ""),
        receivedAt: String(m.receivedDateTime || ""),
        labels: [],
        conversationId: String(m.conversationId || ""),
      };
    });
    return { ...okBase(), messages };
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      messages: [],
    };
  }
}

export async function summarizeThread(conversationId: string) {
  if (!isGraphConfigured()) {
    const summary = mock.mockSummarizeThread(conversationId);
    return summary
      ? { ...okBase(), summary }
      : { ...errBase(`Thread not found: ${conversationId}`), summary: null };
  }
  const searched = await searchEmail(conversationId);
  if (!searched.ok) {
    return { ...errBase(searched.error || "search failed"), summary: null };
  }
  const messages = searched.messages.filter(
    (m) => m.conversationId === conversationId,
  );
  if (messages.length === 0) {
    return { ...errBase(`Thread not found: ${conversationId}`), summary: null };
  }
  return {
    ...okBase(),
    summary: {
      conversationId,
      messageCount: messages.length,
      participants: Array.from(
        new Set(messages.flatMap((m) => [m.from, ...m.to, ...m.cc])),
      ),
      summary: messages.map((m) => `${m.from}: ${m.bodyPreview}`).join(" | "),
    },
  };
}

export async function labelEmail(input: { emailId: string; labels: string[] }) {
  if (!isGraphConfigured()) {
    const message = mock.mockLabelEmail(input);
    return message
      ? { ...okBase(), message }
      : { ...errBase(`Email not found: ${input.emailId}`), message: null };
  }
  // Graph categories map to labels
  try {
    const res = await graphFetch(
      userPath(`/messages/${encodeURIComponent(input.emailId)}`),
      {
        method: "PATCH",
        body: JSON.stringify({ categories: input.labels }),
      },
    );
    if (!res.ok) {
      return {
        ...errBase(`Graph label failed (${res.status}): ${await res.text()}`),
        message: null,
      };
    }
    return {
      ...okBase(),
      message: {
        id: input.emailId,
        labels: input.labels,
      },
    };
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      message: null,
    };
  }
}

export async function replyEmail(input: { emailId: string; body: string }) {
  if (!isGraphConfigured()) {
    const message = mock.mockReplyEmail(input);
    return message
      ? { ...okBase(), message }
      : { ...errBase(`Email not found: ${input.emailId}`), message: null };
  }
  try {
    const res = await graphFetch(
      userPath(`/messages/${encodeURIComponent(input.emailId)}/reply`),
      {
        method: "POST",
        body: JSON.stringify({ comment: input.body }),
      },
    );
    if (!res.ok) {
      return {
        ...errBase(`Graph reply failed (${res.status}): ${await res.text()}`),
        message: null,
      };
    }
    return {
      ...okBase(),
      message: {
        id: `reply-${input.emailId}`,
        emailId: input.emailId,
        body: input.body,
        sentAt: new Date().toISOString(),
      },
    };
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      message: null,
    };
  }
}

export async function postMessage(input: {
  channelId: string;
  text: string;
  teamId?: string;
}) {
  if (!isGraphConfigured()) {
    return { ...okBase(), message: mock.mockPostMessage(input) };
  }
  if (!input.teamId) {
    return {
      ...errBase("teamId is required for live Teams channel posts"),
      message: null,
    };
  }
  try {
    const res = await graphFetch(
      `/teams/${encodeURIComponent(input.teamId)}/channels/${encodeURIComponent(input.channelId)}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          body: { contentType: "text", content: input.text },
        }),
      },
    );
    if (!res.ok) {
      return {
        ...errBase(`Graph Teams post failed (${res.status}): ${await res.text()}`),
        message: null,
      };
    }
    const json = (await res.json()) as { id?: string; createdDateTime?: string };
    return {
      ...okBase(),
      message: {
        id: json.id || "",
        channelId: input.channelId,
        teamId: input.teamId,
        text: input.text,
        createdAt: json.createdDateTime || new Date().toISOString(),
      },
    };
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      message: null,
    };
  }
}

export async function createMeeting(input: {
  subject: string;
  start: string;
  end: string;
  attendees?: string[];
}) {
  if (!isGraphConfigured()) {
    return { ...okBase(), meeting: mock.mockCreateMeeting(input) };
  }
  const event = await scheduleEvent({
    ...input,
    location: "Microsoft Teams Meeting",
  });
  return {
    ok: event.ok,
    mode: event.mode,
    error: event.error,
    meeting: event.event,
  };
}

export async function searchChats(query: string) {
  if (!isGraphConfigured()) {
    return { ...okBase(), chats: mock.mockSearchChats(query) };
  }
  try {
    const res = await graphFetch(`/me/chats?$top=20`);
    if (!res.ok) {
      return {
        ...errBase(`Graph search chats failed (${res.status}): ${await res.text()}`),
        chats: [],
      };
    }
    const json = (await res.json()) as {
      value?: Array<{ id?: string; topic?: string }>;
    };
    const q = query.toLowerCase();
    const chats = (json.value || [])
      .map((c) => ({
        id: c.id || "",
        title: c.topic || "(untitled chat)",
        preview: "",
        lastMessageAt: "",
      }))
      .filter((c) => c.title.toLowerCase().includes(q) || q === "");
    return { ...okBase(), chats };
  } catch (e) {
    return {
      ...errBase(e instanceof Error ? e.message : String(e)),
      chats: [],
    };
  }
}

export async function notifyChannel(input: {
  channelId: string;
  text: string;
  teamId?: string;
}) {
  if (!isGraphConfigured()) {
    return { ...okBase(), message: mock.mockNotifyChannel(input) };
  }
  return postMessage(input);
}
