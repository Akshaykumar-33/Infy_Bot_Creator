import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { draftEmail } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Create an email draft (does not send).
  `,
  effect: "write",
  inputSchema: z.object({
    to: z.array(z.string().email()).min(1),
    subject: z.string().min(1),
    body: z.string().min(1),
  }),
  async execute(input) {
    return draftEmail(input);
  },
});
