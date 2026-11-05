import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { searchChats } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Search Teams chats by title or preview text.
  `,
  effect: "read",
  inputSchema: z.object({ query: z.string().min(1) }),
  async execute(input) {
    return searchChats(input.query);
  },
});
