import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  description:
    "Email specialist: draft, send, search, summarize threads, label, and reply to Outlook/Graph mail.",
  model: {
    id: "grok-4.7",
    params: [{ id: "fast", value: "true" }],
  },
});
