export type GraphMode = "mock" | "live";

export type Attendee = {
  name: string;
  email: string;
  responseStatus: "none" | "organizer" | "tentativelyAccepted" | "accepted" | "declined" | "notResponded";
};

export type CalendarEventDetails = {
  id: string;
  subject: string;
  start: string;
  end: string;
  timeZone: string;
  isAllDay: boolean;
  organizer: { name: string; email: string };
  attendees: Attendee[];
  location: string;
  onlineMeetingUrl: string | null;
  bodyPreview: string;
  showAs: "free" | "tentative" | "busy" | "oof" | "workingElsewhere" | "unknown";
  importance: "low" | "normal" | "high";
  categories: string[];
  webLink: string;
};

export type EmailMessage = {
  id: string;
  subject: string;
  from: string;
  to: string[];
  cc: string[];
  bodyPreview: string;
  body: string;
  receivedAt: string;
  labels: string[];
  conversationId: string;
};

export type TeamsMessageResult = {
  id: string;
  channelId: string;
  teamId: string | null;
  text: string;
  createdAt: string;
};

export type ToolResultBase = {
  ok: boolean;
  mode: GraphMode;
  error?: string;
};
