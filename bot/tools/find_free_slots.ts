import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { findFreeSlots } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Find free time slots in a window for a given duration.
  `,
  effect: "read",
  inputSchema: z.object({
    start: z.string().min(1),
    end: z.string().min(1),
    durationMinutes: z.number().int().positive(),
  }),
  async execute(input) {
    return findFreeSlots(input);
  },
});
