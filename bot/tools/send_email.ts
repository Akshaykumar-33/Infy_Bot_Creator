import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { sendEmail } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Send an email, optionally from an existing draftId.
  `,
  effect: "write",
  inputSchema: z.object({
    to: z.array(z.string().email()).min(1),
    subject: z.string().min(1),
    body: z.string().min(1),
    draftId: z.string().optional(),
  }),
  async execute(input) {
    return sendEmail(input);
  },
});
