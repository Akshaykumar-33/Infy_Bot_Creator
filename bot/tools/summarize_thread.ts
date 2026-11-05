import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { summarizeThread } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Summarize an email conversation by conversationId.
  `,
  effect: "read",
  inputSchema: z.object({ conversationId: z.string().min(1) }),
  async execute(input) {
    return summarizeThread(input.conversationId);
  },
});
