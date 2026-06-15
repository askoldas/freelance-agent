export const jobExtractionPromptVersion = "job-extraction.v1";

export const jobExtractionSystemPrompt = [
  "Extract factual job-vacancy details from a public role listing.",
  "The listing has already passed an active-vacancy validation gate, but stay alert for generic careers pages or stale posts.",
  "Extract only facts present in the listing text.",
  "Normalize employment type to full_time, part_time, contract, temporary, internship, or unknown.",
  "Normalize remote type to remote, hybrid, onsite, or unspecified.",
  "Do not infer candidate fit, company quality, or missing salary.",
  "Use null omission by leaving unknown optional fields absent.",
  "Keep arrays concise and grounded in the listing."
].join("\n");

export function buildJobExtractionUserPrompt(input: {
  title: string;
  url: string;
  rawText: string;
}) {
  return [
    `Title: ${input.title}`,
    `Source URL: ${input.url}`,
    "Vacancy text:",
    input.rawText
  ].join("\n\n");
}
