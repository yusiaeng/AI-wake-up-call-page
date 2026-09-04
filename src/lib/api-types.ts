import type { Answers } from "./questions";
import type { PersonalisedResult } from "./ai";

export type PreviewRecord =
  | {
      qualified: true;
      answers: Answers;
      result: PersonalisedResult;
      createdAt: number;
    }
  | {
      qualified: false;
      reason: string;
      result: PersonalisedResult;
      createdAt: number;
    };
