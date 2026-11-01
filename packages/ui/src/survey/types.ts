export const SURVEY_SCHEMA_VERSION = 1 as const;

export type SurveyQuestionType =
  | "text"
  | "longtext"
  | "number"
  | "single"
  | "multiple"
  | "dropdown"
  | "boolean"
  | "rating"
  | "opinion"
  | "likert"
  | "date"
  | "time"
  | "datetime"
  | "email"
  | "url"
  | "phone"
  | "file"
  | "image"
  | "matrix"
  | "ranking"
  | "signature"
  | "content"
  | "section";

export interface SurveyChoice {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SurveyValidation {
  required?: boolean;
  requiredMessage?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  custom?: string; // expression that must evaluate truthy
}

export interface SurveyVisibility {
  /** Expression evaluated against answers; truthy shows the question. */
  expression?: string;
  /** Question ids this depends on (for re-evaluation). */
  dependsOn?: string[];
}

export interface SurveyQuestionBase {
  id: string;
  type: SurveyQuestionType;
  title: string;
  description?: string;
  helpText?: string;
  placeholder?: string;
  defaultValue?: unknown;
  validation?: SurveyValidation;
  visibleIf?: SurveyVisibility;
  requiredIf?: SurveyVisibility;
  readOnly?: boolean;
  disabled?: boolean;
  name?: string; // form field name override
}

export interface TextQuestion extends SurveyQuestionBase {
  type: "text" | "longtext" | "email" | "url" | "phone";
  maxLength?: number;
}

export interface NumberQuestion extends SurveyQuestionBase {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

export interface ChoiceQuestion extends SurveyQuestionBase {
  type: "single" | "multiple" | "dropdown";
  choices: SurveyChoice[];
  allowOther?: boolean;
  otherLabel?: string;
  dynamicChoices?: string; // expression returning choices
}

export interface BooleanQuestion extends SurveyQuestionBase {
  type: "boolean";
  trueLabel?: string;
  falseLabel?: string;
}

export interface RatingQuestion extends SurveyQuestionBase {
  type: "rating";
  max?: number;
  icon?: "star" | "heart" | "thumb";
  allowClear?: boolean;
}

export interface OpinionQuestion extends SurveyQuestionBase {
  type: "opinion";
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface LikertQuestion extends SurveyQuestionBase {
  type: "likert";
  statements: string[];
  choices: SurveyChoice[];
}

export interface DateQuestion extends SurveyQuestionBase {
  type: "date" | "time" | "datetime";
}

export interface FileQuestion extends SurveyQuestionBase {
  type: "file";
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
}

export interface ImageQuestion extends SurveyQuestionBase {
  type: "image";
  choices: { value: string; src: string; alt?: string }[];
  multiple?: boolean;
}

export interface MatrixQuestion extends SurveyQuestionBase {
  type: "matrix";
  rows: string[];
  columns: SurveyChoice[];
  cellType?: "radio" | "checkbox" | "text";
}

export interface RankingQuestion extends SurveyQuestionBase {
  type: "ranking";
  choices: SurveyChoice[];
}

export interface SignatureQuestion extends SurveyQuestionBase {
  type: "signature";
  width?: number;
  height?: number;
}

export interface ContentQuestion extends SurveyQuestionBase {
  type: "content";
  html?: string;
  markdown?: string;
}

export interface SectionQuestion extends SurveyQuestionBase {
  type: "section";
  questions: SurveyQuestion[];
}

export type SurveyQuestion =
  | TextQuestion
  | NumberQuestion
  | ChoiceQuestion
  | BooleanQuestion
  | RatingQuestion
  | OpinionQuestion
  | LikertQuestion
  | DateQuestion
  | FileQuestion
  | ImageQuestion
  | MatrixQuestion
  | RankingQuestion
  | SignatureQuestion
  | ContentQuestion
  | SectionQuestion;

export interface SurveyPage {
  id: string;
  title?: string;
  description?: string;
  questions: SurveyQuestion[];
  visibleIf?: SurveyVisibility;
}

export interface SurveySettings {
  showProgressBar?: boolean;
  allowBack?: boolean;
  autoAdvance?: boolean;
  submitLabel?: string;
  locale?: string;
  theme?: string;
}

export interface SurveySchema {
  version: typeof SURVEY_SCHEMA_VERSION;
  id: string;
  title: string;
  description?: string;
  pages: SurveyPage[];
  settings?: SurveySettings;
}

export type SurveyAnswers = Record<string, unknown>;

export interface SurveyValidationError {
  questionId: string;
  message: string;
}

export function questionIds(schema: SurveySchema): string[] {
  const ids: string[] = [];
  const walk = (qs: SurveyQuestion[]) => {
    for (const q of qs) {
      if (q.type === "section") walk(q.questions);
      else ids.push(q.id);
    }
  };
  for (const p of schema.pages) walk(p.questions);
  return ids;
}

export function findQuestion(schema: SurveySchema, id: string): SurveyQuestion | undefined {
  let found: SurveyQuestion | undefined;
  const walk = (qs: SurveyQuestion[]) => {
    for (const q of qs) {
      if (q.id === id) { found = q; return; }
      if (q.type === "section") walk(q.questions);
    }
  };
  for (const p of schema.pages) { walk(p.questions); if (found) return found; }
  return found;
}
