import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { setReminder } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Set a reminder for a calendar event.
  `,
  effect: "write",
  inputSchema: z.object({
    eventId: z.string().min(1),
    remindAt: z.string().min(1),
    message: z.string().optional(),
  }),
  async execute(input) {
    return setReminder(input);
  },
});
