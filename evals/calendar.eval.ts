import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke", "calendar"],
  description: "Calendar bot lists upcoming events with full details.",
  cases: [
    {
      id: "upcoming-events-details",
      description: "Upcoming meetings path uses list_upcoming_events.",
      async test(t) {
        await t.send(
          "List all my upcoming events and meetings with full details for the next two weeks.",
        );
        t.succeeded();
        t.calledSubagent("calendar");
        t.calledTool("list_upcoming_events");
      },
    },
  ],
});
