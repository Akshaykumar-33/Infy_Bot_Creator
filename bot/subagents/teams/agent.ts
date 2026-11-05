import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  description:
    "Teams specialist: post channel messages, create Teams meetings, search chats, and notify channels.",
  model: {
    id: "grok-4.7",
    params: [{ id: "fast", value: "true" }],
  },
});
