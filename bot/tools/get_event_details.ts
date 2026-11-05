import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { getEventDetails } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Get full details for a single calendar event by id.
  `,
  effect: "read",
  inputSchema: z.object({ eventId: z.string().min(1) }),
  async execute(input) {
    return getEventDetails(input.eventId);
  },
});
