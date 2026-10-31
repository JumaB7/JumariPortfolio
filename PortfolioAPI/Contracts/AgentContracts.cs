using System.Text.Json.Serialization;

namespace PortfolioAPI.Contracts;

public record AgentChatRequest(string Message, string? SessionId = null);

public record AgentToolActivity(
    [property: JsonPropertyName("tool_name")] string ToolName,
    string Status,
    string? Detail = null,
    Dictionary<string, object?>? Arguments = null,
    Dictionary<string, object?>? Result = null);

public record AgentChatResponse(
    string Answer,
    [property: JsonPropertyName("tool_activity")] IReadOnlyList<AgentToolActivity> ToolActivity,
    string Model,
    int Iterations,
    [property: JsonPropertyName("llm_calls")] int LlmCalls = 0,
    [property: JsonPropertyName("answer_source")] string AnswerSource = "router",
    [property: JsonPropertyName("is_demo_dataset")] bool? IsDemoDataset = true);
