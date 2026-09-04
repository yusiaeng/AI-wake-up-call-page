export type Option = { value: string; label: string };

export type CardQuestion = {
  id: string;
  kind: "cards";
  title: string;
  getTitle?: (answers: Answers) => string;
  helper?: string;
  options: Option[];
};

export type ChipsTextQuestion = {
  id: string;
  kind: "chips-text";
  title: string;
  getTitle?: (answers: Answers) => string;
  helper?: string;
  chips: Option[];
};

export type Question = CardQuestion | ChipsTextQuestion;

export function questionTitle(question: Question, answers: Answers): string {
  return question.getTitle ? question.getTitle(answers) : question.title;
}

// Sectors that report a "budget" or "income" rather than commercial
// "turnover" — asking a charity or NHS trust for "turnover" reads as a
// translation stumble at the one moment we most want to feel like we
// already know who they are.
const INCOME_SECTORS = new Set(["charity", "faith"]);
const BUDGET_SECTORS = new Set(["nhs", "local-gov", "central-gov", "housing", "education"]);

function turnoverTitle(answers: Answers): string {
  const sector = answers.sector;
  if (sector && INCOME_SECTORS.has(sector)) return "What's your annual income?";
  if (sector && BUDGET_SECTORS.has(sector)) return "What's your annual budget?";
  return "What's your annual turnover?";
}

function boardConfidenceTitle(answers: Answers): string {
  if (answers.role === "no-board") {
    return "How confident is your senior team discussing AI risk?";
  }
  return "How confident is your board discussing AI risk?";
}

// Order matters: sector/size first (context), role before turnover (turnover
// reads less intrusive once someone's already told us who they are), then
// the AI-situation questions, ending on the free-text motivation prompt.
export const QUESTIONS: Question[] = [
  {
    id: "sector",
    kind: "cards",
    title: "Which best describes your organisation?",
    options: [
      { value: "education", label: "Education (School / College / University)" },
      { value: "nhs", label: "NHS / Healthcare" },
      { value: "local-gov", label: "Local Government" },
      { value: "central-gov", label: "Central Government" },
      { value: "housing", label: "Housing Association" },
      { value: "charity", label: "Charity / Third Sector" },
      { value: "corporate", label: "Corporate / Private Sector" },
      { value: "professional", label: "Professional Services" },
      { value: "faith", label: "Faith Organisation" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "companySize",
    kind: "cards",
    title: "How many people work there?",
    options: [
      { value: "1-10", label: "1–10" },
      { value: "11-50", label: "11–50" },
      { value: "51-200", label: "51–200" },
      { value: "201-500", label: "201–500" },
      { value: "501-1000", label: "501–1,000" },
      { value: "1001-5000", label: "1,001–5,000" },
      { value: "5000+", label: "5,000+" },
    ],
  },
  {
    id: "role",
    kind: "cards",
    title: "What's your role there?",
    options: [
      { value: "board", label: "Board member or trustee" },
      { value: "exec", label: "Chief exec / senior leadership team" },
      { value: "other-staff", label: "Other staff member" },
      { value: "no-board", label: "We don't have a formal board" },
    ],
  },
  {
    id: "turnover",
    kind: "cards",
    title: "What's your annual turnover?",
    getTitle: turnoverTitle,
    options: [
      { value: "under-500k", label: "Under £500k" },
      { value: "500k-1m", label: "£500k – £1m" },
      { value: "1m-5m", label: "£1m – £5m" },
      { value: "5m-10m", label: "£5m – £10m" },
      { value: "10m-50m", label: "£10m – £50m" },
      { value: "50m+", label: "£50m+" },
    ],
  },
  {
    id: "aiUsage",
    kind: "cards",
    title: "Is AI already being used at your organisation?",
    options: [
      { value: "managing-well", label: "Yes, and we're managing it well" },
      { value: "no-oversight", label: "Yes, but no real oversight" },
      { value: "informal", label: "A bit, informally (staff trying tools)" },
      { value: "not-yet", label: "Not yet, but we want to start" },
    ],
  },
  {
    id: "governance",
    kind: "cards",
    title: "Do you have an AI policy or anyone responsible for it?",
    options: [
      { value: "dedicated", label: "Yes, dedicated policy & oversight in place" },
      { value: "informal", label: "Something informal / ad hoc" },
      { value: "none", label: "No, nothing yet" },
    ],
  },
  {
    id: "boardConfidence",
    kind: "cards",
    title: "How confident is your board discussing AI risk?",
    getTitle: boardConfidenceTitle,
    options: [
      { value: "very", label: "Very confident" },
      { value: "somewhat", label: "Somewhat confident" },
      { value: "not-very", label: "Not very confident" },
      { value: "not-discussed", label: "Haven't really discussed it" },
    ],
  },
  {
    id: "motivation",
    kind: "chips-text",
    title: "What's prompting you to look into this now?",
    helper: "Pick the closest one, or type your own.",
    chips: [
      { value: "unapproved-tools", label: "Staff using tools we haven't approved" },
      { value: "incident", label: "A specific incident or near miss" },
      { value: "asked", label: "Board or regulator asked us to look into it" },
      { value: "ahead", label: "Want to get ahead of it" },
    ],
  },
];

export type Answers = Record<string, string>;

// Answers are stored as short machine values ("housing", "1-10") for
// filtering/hashing/URLs. The AI prompt needs the human labels instead
// ("Housing Association", "1–10") so the model has real words to work with
// rather than slugs — this is what lets its output actually read as sector-
// and size-aware instead of generic.
export function describeAnswers(answers: Answers): Record<string, string> {
  const described: Record<string, string> = {};
  for (const q of QUESTIONS) {
    const value = answers[q.id];
    if (value === undefined) continue;
    const options = q.kind === "cards" ? q.options : q.chips;
    const match = options.find((o) => o.value === value);
    // Free-typed motivation won't match a chip — pass the typed text through as-is.
    described[q.id] = match ? match.label : value;
  }
  return described;
}
