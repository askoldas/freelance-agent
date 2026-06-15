import { encodeTelegramCallback } from "./callbacks";

export type OpportunityNotification = {
  opportunityId: string;
  title: string;
  sourceUrl: string;
  sourceName: string;
  score: number;
  fitLevel: string;
  recommendation: string;
  summary: string;
  matchReasons: string[];
  risks: string[];
};

export type JobVacancyNotification = {
  jobVacancyId: string;
  role: string;
  company?: string;
  sourceUrl: string;
  applicationUrl?: string;
  score: number;
  fitLevel: string;
  recommendation: string;
  freshness: string;
  location?: string;
  remoteType?: string;
  strongestMatch?: string;
  mainGap?: string;
  summary: string;
};

function escapeHtml(input: string) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function formatOpportunityNotification(input: OpportunityNotification) {
  const reasons = input.matchReasons.slice(0, 3).map((reason) => `- ${reason}`);
  const risks = input.risks.slice(0, 3).map((risk) => `- ${risk}`);

  return [
    `<b>${escapeHtml(input.title)}</b>`,
    `${input.score}/100 · ${escapeHtml(input.fitLevel)} · ${escapeHtml(input.recommendation)}`,
    "",
    escapeHtml(input.summary),
    "",
    "<b>Reasons</b>",
    escapeHtml(reasons.join("\n") || "- No reasons provided."),
    "",
    "<b>Risks</b>",
    escapeHtml(risks.join("\n") || "- No risks provided."),
    "",
    `<a href="${escapeHtml(input.sourceUrl)}">Open source</a>`
  ].join("\n");
}

export function buildOpportunityKeyboard(opportunityId: string) {
  return {
    inline_keyboard: [
      [
        {
          text: "Save",
          callback_data: encodeTelegramCallback({ action: "save", opportunityId })
        },
        {
          text: "Reject",
          callback_data: encodeTelegramCallback({ action: "reject", opportunityId })
        }
      ],
      [
        {
          text: "Details",
          callback_data: encodeTelegramCallback({ action: "details", opportunityId })
        },
        {
          text: "Proposal",
          callback_data: encodeTelegramCallback({ action: "proposal", opportunityId })
        }
      ]
    ]
  };
}

export function formatJobVacancyNotification(input: JobVacancyNotification) {
  return [
    "<b>Job vacancy</b>",
    `<b>${escapeHtml(input.role)}</b>`,
    input.company ? escapeHtml(input.company) : "Company not stated",
    `${input.score}/100 Â· ${escapeHtml(input.fitLevel)} Â· ${escapeHtml(input.recommendation)}`,
    `Freshness: ${escapeHtml(input.freshness)}`,
    `Location: ${escapeHtml(input.location ?? "Not stated")}`,
    `Remote: ${escapeHtml(input.remoteType ?? "unspecified")}`,
    "",
    escapeHtml(input.summary),
    "",
    `<b>Strongest match</b>\n${escapeHtml(input.strongestMatch ?? "Not stated.")}`,
    "",
    `<b>Main gap</b>\n${escapeHtml(input.mainGap ?? "Not stated.")}`,
    "",
    `<a href="${escapeHtml(input.applicationUrl ?? input.sourceUrl)}">Application link</a>`,
    `<a href="${escapeHtml(input.sourceUrl)}">Source</a>`
  ].join("\n");
}
