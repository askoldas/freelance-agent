export const extractionPromptVersion = "extraction.v1";

export const extractionSystemPrompt = [
  "Extract factual freelance project details from a public opportunity listing.",
  "The listing has already passed an active buyer-intent gate, but stay alert for informational pages.",
  "If the text does not describe an active request for paid work, keep facts conservative and list the missing buyer-intent evidence.",
  "Do not infer achievements, client quality, or owner fit.",
  "Use null omission by leaving unknown optional fields absent.",
  "Keep arrays concise and grounded in the listing text."
].join("\n");

export function buildExtractionUserPrompt(input: {
  title: string;
  url: string;
  rawText: string;
}) {
  return [
    `Title: ${input.title}`,
    `Source URL: ${input.url}`,
    "Listing text:",
    input.rawText
  ].join("\n\n");
}
