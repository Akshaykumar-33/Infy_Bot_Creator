import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { rescheduleEvent } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Reschedule an existing calendar event.
  `,
  effect: "write",
  inputSchema: z.object({
    eventId: z.string().min(1),
    start: z.string().min(1),
    end: z.string().min(1),
    timeZone: z.string().optional(),
  }),
  async execute(input) {
    return rescheduleEvent(input);
  },
});
