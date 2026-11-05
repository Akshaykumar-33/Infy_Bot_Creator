import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke", "routing"],
  description: "Infy_bot delegates domain asks to the matching Grok specialist bot.",
  cases: [
    {
      id: "route-to-email",
      description: "Draft-email request goes to the email subagent.",
      async test(t) {
        await t.send(
          'Draft an email to alex.chen@contoso.com with subject "Q2 review" and a short body asking them to confirm attendance.',
        );
        t.succeeded();
        t.calledSubagent("email");
      },
    },
    {
      id: "route-to-teams",
      description: "Channel notify request goes to the teams subagent.",
      async test(t) {
        await t.send(
          "Notify the Engineering Teams channel (channelId eng-general) that the deploy finished successfully.",
        );
        t.succeeded();
        t.calledSubagent("teams");
      },
    },
    {
      id: "route-to-calendar",
      description: "Upcoming meetings request goes to the calendar subagent.",
      async test(t) {
        await t.send(
          "What are all my upcoming meetings? Include attendees and join links.",
        );
        t.succeeded();
        t.calledSubagent("calendar");
      },
    },
    {
      id: "mixed-email-teams",
      description: "Mixed mail + Teams notify uses email then teams.",
      async test(t) {
        await t.send(
          'Search email for "Q2 review", summarize what you find, then notify Teams channel eng-general that the agenda was reviewed.',
        );
        t.succeeded();
        t.calledSubagent("email");
        t.calledSubagent("teams");
      },
    },
  ],
});
