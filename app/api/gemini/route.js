// app/api/gemini/route.js

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

const MODEL = "gemini-3.6-flash";

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error: "GEMINI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();

    const {
      system,
      messages = [],
      previous_interaction_id = null,
    } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        {
          error: "Messages are required.",
        },
        { status: 400 }
      );
    }

    // Get the latest user message
    const lastUserMessage = [...messages]
      .reverse()
      .find(
        (message) =>
          message?.role === "user" &&
          message?.content !== undefined
      );

    if (!lastUserMessage) {
      return Response.json(
        {
          error: "No user message found.",
        },
        { status: 400 }
      );
    }

    const input = String(lastUserMessage.content);

    // ------------------------------------------------
    // Gemini request
    // ------------------------------------------------

    const requestBody = {
      model: MODEL,
      input: input,
    };

    // Add system instruction if supplied
    if (system) {
      requestBody.system_instruction = system;
    }

    // Continue previous Gemini interaction
    if (previous_interaction_id) {
      requestBody.previous_interaction_id =
        previous_interaction_id;
    }

    // IMPORTANT:
    // Do NOT add generation_config.
    // Do NOT add max_tokens.
    // Do NOT add temperature.
    
    console.log(
      "Calling Gemini Interactions API:",
      MODEL
    );

    console.log(
      "Previous interaction:",
      previous_interaction_id || "none"
    );

    console.log(
      "Gemini request body:",
      JSON.stringify(requestBody, null, 2)
    );

    // ------------------------------------------------
    // Call Gemini
    // ------------------------------------------------

    const response = await fetch(
      GEMINI_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    // ------------------------------------------------
    // Gemini error
    // ------------------------------------------------

    if (!response.ok) {
      console.error(
        "Gemini API error:",
        JSON.stringify(data, null, 2)
      );

      return Response.json(
        {
          error:
            data?.error?.message ||
            "Gemini API request failed.",

          code:
            data?.error?.code ||
            "gemini_api_error",
        },
        {
          status: response.status,
        }
      );
    }

    console.log(
      "Gemini request successful."
    );

    // ------------------------------------------------
    // Extract Gemini response
    // ------------------------------------------------

    let content = "";

    // Current Interactions API response
    if (Array.isArray(data.steps)) {
      for (
        let i = data.steps.length - 1;
        i >= 0;
        i--
      ) {
        const step = data.steps[i];

        if (
          step?.type === "model_output" &&
          Array.isArray(step.content)
        ) {
          const text = step.content
            .filter(
              (item) =>
                item?.type === "text"
            )
            .map(
              (item) =>
                item.text
            )
            .filter(Boolean)
            .join("\n");

          if (text) {
            content = text;
            break;
          }
        }
      }
    }

    // output_text fallback
    if (
      !content &&
      typeof data.output_text === "string"
    ) {
      content = data.output_text;
    }

    // outputs fallback
    if (
      !content &&
      Array.isArray(data.outputs)
    ) {
      for (const output of data.outputs) {
        if (
          typeof output?.text === "string"
        ) {
          content = output.text;
          break;
        }

        if (Array.isArray(output?.content)) {
          const text = output.content
            .filter(
              (item) =>
                item?.type === "text"
            )
            .map(
              (item) =>
                item.text
            )
            .filter(Boolean)
            .join("\n");

          if (text) {
            content = text;
            break;
          }
        }
      }
    }

    // ------------------------------------------------
    // Empty response
    // ------------------------------------------------

    if (!content) {
      console.error(
        "Gemini returned no text."
      );

      console.error(
        "FULL GEMINI RESPONSE:",
        JSON.stringify(
          data,
          null,
          2
        )
      );

      return Response.json(
        {
          error:
            "Gemini returned an empty response.",
        },
        { status: 502 }
      );
    }

    console.log(
      "Gemini content:",
      content
    );

    // ------------------------------------------------
    // Return to page.jsx
    // ------------------------------------------------

    return Response.json({
      content: content,

      interaction_id:
        data.id || null,

      model:
        data.model || MODEL,
    });
  } catch (error) {
    console.error(
      "Gemini route error:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected Gemini server error.",
      },
      { status: 500 }
    );
  }
}