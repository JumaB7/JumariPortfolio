using PortfolioAPI.Contracts;

namespace PortfolioAPI.Agent;

/// <summary>
/// In-process portfolio agent (same App Service as the API).
/// Rule router + allowlisted SQL-backed tools — no separate FastAPI host.
/// </summary>
public class AgentOrchestrator(AgentTools tools)
{
    public async Task<AgentChatResponse> RunAsync(string message, CancellationToken ct = default)
    {
        var cleaned = message.Trim();
        if (string.IsNullOrWhiteSpace(cleaned))
        {
            return new AgentChatResponse(
                "Please ask a non-empty analytics question about the portfolio showcase data.",
                [],
                "rule-router",
                0,
                AnswerSource: "template");
        }

        var route = AgentRouter.Route(cleaned);
        if (route is null)
        {
            return new AgentChatResponse(
                AgentRouter.UnsupportedAnswer
                + " Examples: “How many projects?”, “Top technologies?”, “Tell me about Veld Supply”.",
                [],
                "rule-router",
                0,
                AnswerSource: "template");
        }

        if (route.Kind is "greeting" or "unsupported")
        {
            return new AgentChatResponse(
                route.Answer ?? AgentRouter.UnsupportedAnswer,
                [],
                "rule-router",
                0,
                AnswerSource: "router");
        }

        if (route.Kind != "tool" || string.IsNullOrWhiteSpace(route.ToolName))
        {
            return new AgentChatResponse(
                AgentRouter.UnsupportedAnswer,
                [],
                "rule-router",
                0,
                AnswerSource: "template");
        }

        var args = route.Arguments ?? new Dictionary<string, object?>();
        var (result, ok, detail) = await tools.ExecuteAsync(route.ToolName, args, ct);
        var activity = new AgentToolActivity(
            route.ToolName,
            ok ? "ok" : "error",
            detail,
            args,
            result);

        var answer = ok
            ? AgentAnswers.Render(route.ToolName, result)
                ?? "I ran an allowlisted tool but could not format an answer."
            : detail;

        return new AgentChatResponse(
            answer,
            [activity],
            "rule-router",
            1,
            LlmCalls: 0,
            AnswerSource: "router",
            IsDemoDataset: result.GetValueOrDefault("is_demo_dataset") as bool? ?? true);
    }
}
