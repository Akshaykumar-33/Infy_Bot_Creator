import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { createMeeting } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Create a Teams online meeting / calendar event.
  `,
  effect: "write",
  inputSchema: z.object({
    subject: z.string().min(1),
    start: z.string().min(1),
    end: z.string().min(1),
    attendees: z.array(z.string().email()).optional(),
  }),
  async execute(input) {
    return createMeeting(input);
  },
});
