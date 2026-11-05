import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { replyEmail } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Reply to an existing email message.
  `,
  effect: "write",
  inputSchema: z.object({
    emailId: z.string().min(1),
    body: z.string().min(1),
  }),
  async execute(input) {
    return replyEmail(input);
  },
});
