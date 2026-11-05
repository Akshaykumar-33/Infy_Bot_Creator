import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  description:
    "Calendar specialist: list all upcoming events/meetings with full details, get one event, schedule, find free slots, reschedule, and set reminders.",
  model: {
    id: "grok-4.7",
    params: [{ id: "fast", value: "true" }],
  },
});
