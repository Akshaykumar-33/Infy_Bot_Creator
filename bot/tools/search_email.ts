import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { searchEmail } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Search mailbox messages by free-text query.
  `,
  effect: "read",
  inputSchema: z.object({ query: z.string().min(1) }),
  async execute(input) {
    return searchEmail(input.query);
  },
});
