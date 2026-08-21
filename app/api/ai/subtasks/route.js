import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request) {
    try {
        const body = await request.json();

        const { title, description } = body;

        if (!title?.trim()) {
            return Response.json(
                { error: "Task title is required." },
                { status: 400 }
            );
        }

        const prompt = `
You are an assistant for TaskMatrix, an Agile project management application.

Generate practical subtasks for the following task.

Task title:
${title}

Task description:
${description || "No description provided."}

Return ONLY a valid JSON object in this exact format:

{
  "subtasks": [
    "Subtask 1",
    "Subtask 2",
    "Subtask 3"
  ]
}

Rules:
- Generate between 3 and 7 subtasks.
- Each subtask must be a concrete, actionable task.
- Keep each subtask concise.
- Do not include numbering.
- Do not include markdown.
- Do not include explanations outside the JSON object.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text.trim();

        let result;

        try {
            result = JSON.parse(text);
        } catch {
            console.error("Gemini returned invalid JSON:", text);

            return Response.json(
                { error: "AI returned an invalid response." },
                { status: 502 }
            );
        }

        if (
            !result.subtasks ||
            !Array.isArray(result.subtasks) ||
            result.subtasks.length === 0
        ) {
            return Response.json(
                { error: "AI did not return any subtasks." },
                { status: 502 }
            );
        }

        return Response.json({
            subtasks: result.subtasks,
        });
    } catch (error) {
        console.error("AI subtask generation failed:", error);

        return Response.json(
            { error: "Failed to generate subtasks." },
            { status: 500 }
        );
    }
}