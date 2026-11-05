import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { notifyChannel } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Send a notification-style message to a Teams channel.
  `,
  effect: "write",
  inputSchema: z.object({
    channelId: z.string().min(1),
    text: z.string().min(1),
    teamId: z.string().optional(),
  }),
  async execute(input) {
    return notifyChannel(input);
  },
});
