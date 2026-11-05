import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { scheduleEvent } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Schedule a new calendar event.
  `,
  effect: "write",
  inputSchema: z.object({
    subject: z.string().min(1),
    start: z.string().min(1),
    end: z.string().min(1),
    timeZone: z.string().optional(),
    attendees: z.array(z.string().email()).optional(),
    location: z.string().optional(),
    bodyPreview: z.string().optional(),
  }),
  async execute(input) {
    return scheduleEvent(input);
  },
});
