import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { listUpcomingEvents } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    List all upcoming calendar events/meetings with full details (default window: now to +14 days). Includes subject, times, attendees, location, join link, agenda preview, organizer, free/busy, categories, and webLink.
  `,
  effect: "read",
  inputSchema: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
    top: z.number().int().positive().max(100).optional(),
  }),
  async execute(input) {
    return listUpcomingEvents(input);
  },
});
