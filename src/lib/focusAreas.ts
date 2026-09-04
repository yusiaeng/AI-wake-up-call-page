// The Bare Minimum standard itself is fixed — this pool of six never changes.
// Personalisation only ever affects which 3-4 are picked and how the blurb is
// worded, never what the standard actually requires.
export type FocusArea = {
  key: string;
  label: string;
  defaultBlurb: string;
};

export const FOCUS_AREAS: FocusArea[] = [
  {
    key: "policy",
    label: "AI use policy",
    defaultBlurb:
      "A short, plain-English policy on what staff can and can't do with AI tools, and when to ask before using one.",
  },
  {
    key: "oversight",
    label: "Board oversight & reporting",
    defaultBlurb:
      "One named person on the board who owns AI governance, and a standing item to review it - not a one-off conversation.",
  },
  {
    key: "data",
    label: "Data & confidentiality checks",
    defaultBlurb:
      "A clear line on what information can and can't be typed into an AI tool, especially anything about service users or staff.",
  },
  {
    key: "vendor",
    label: "Vendor AI due diligence",
    defaultBlurb:
      "A short list of questions to ask any supplier who tells you their product 'uses AI', before you sign anything.",
  },
  {
    key: "training",
    label: "Staff awareness & training",
    defaultBlurb:
      "Making sure staff actually know the policy exists, what it says, and who to ask if they're unsure.",
  },
  {
    key: "incident",
    label: "Incident & escalation route",
    defaultBlurb:
      "A plain route for someone to flag it if an AI tool gets something wrong or is used inappropriately - and who picks it up.",
  },
];

export function getFocusArea(key: string): FocusArea | undefined {
  return FOCUS_AREAS.find((f) => f.key === key);
}
