import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { labelEmail } from "../lib/graph/index.js";

export default defineTool({
  description: prompt`
    Add labels/categories to an email message.
  `,
  effect: "write",
  inputSchema: z.object({
    emailId: z.string().min(1),
    labels: z.array(z.string().min(1)).min(1),
  }),
  async execute(input) {
    return labelEmail(input);
  },
});
