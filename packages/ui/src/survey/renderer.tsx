import { useCallback, useMemo, useState, type FormEvent } from "react";
import { evaluateCondition } from "./expression";
import React from "react";
import type {
  SurveyAnswers,

  SurveyQuestion,
  SurveySchema,
  SurveyValidationError,
} from "./types";

export interface SurveyRendererProps {
  schema: SurveySchema;
  defaultValues?: SurveyAnswers;
  readOnly?: boolean;
  disabled?: boolean;
  onSubmit?: (answers: SurveyAnswers) => void;
  onChange?: (answers: SurveyAnswers) => void;
  className?: string;
}

function isVisible(q: SurveyQuestion, answers: SurveyAnswers): boolean {
  return evaluateCondition(q.visibleIf?.expression, { answers });
}

function isRequired(q: SurveyQuestion, answers: SurveyAnswers): boolean {
  if (q.validation?.required) return true;
  if (q.requiredIf?.expression) return evaluateCondition(q.requiredIf.expression, { answers });
  return false;
}

function validateQuestion(q: SurveyQuestion, value: unknown, answers: SurveyAnswers): string | null {
  const required = isRequired(q, answers);
  if (required && (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0))) {
    return q.validation?.requiredMessage ?? "This question is required.";
  }
  if (value === undefined || value === null || value === "") return null;
  const v = q.validation;
  if (v) {
    if (typeof value === "number") {
      if (v.min !== undefined && value < v.min) return `Must be at least ${v.min}.`;
      if (v.max !== undefined && value > v.max) return `Must be at most ${v.max}.`;
    }
    if (typeof value === "string") {
      if (v.minLength !== undefined && value.length < v.minLength) return `Must be at least ${v.minLength} characters.`;
      if (v.maxLength !== undefined && value.length > v.maxLength) return `Must be at most ${v.maxLength} characters.`;
      if (v.pattern) {
        try { if (!new RegExp(v.pattern).test(value)) return v.patternMessage ?? "Invalid format."; } catch { /* ignore */ }
      }
    }
    if (v.custom) {
      const ok = evaluateCondition(v.custom, { answers, value });
      if (!ok) return "Invalid value.";
    }
  }
  // type-specific
  if (q.type === "number") {
    const nq = q as { min?: number; max?: number };
    if (typeof value === "number") {
      if (nq.min !== undefined && value < nq.min) return `Must be at least ${nq.min}.`;
      if (nq.max !== undefined && value > nq.max) return `Must be at most ${nq.max}.`;
    }
  }
  if (q.type === "email" && typeof value === "string" && value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email.";
  }
  if (q.type === "url" && typeof value === "string" && value) {
    try { new URL(value); } catch { return "Enter a valid URL."; }
  }
  return null;
}

function QuestionField({
  q,
  value,
  onChange,
  error,
  readOnly,
  disabled,
  answers,
}: {
  q: SurveyQuestion;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string | null;
  readOnly?: boolean;
  disabled?: boolean;
  answers: SurveyAnswers;
}) {
  const req = isRequired(q, answers);
  const id = `q-${q.id}`;
  const label = (
    <label htmlFor={id} className="ui-survey__label">
      {q.title}
      {req && <span className="ui-survey__required" aria-hidden="true"> *</span>}
    </label>
  );
  const desc = q.description ? <p className="ui-survey__description">{q.description}</p> : null;
  const help = q.helpText ? <p className="ui-survey__help">{q.helpText}</p> : null;
  const err = error ? <p className="ui-survey__error" role="alert">{error}</p> : null;

  let control: React.ReactNode;
  switch (q.type) {
    case "text":
    case "email":
    case "url":
    case "phone":
      control = (
        <input
          id={id}
          type={q.type === "email" ? "email" : q.type === "url" ? "url" : q.type === "phone" ? "tel" : "text"}
          className="ui-input ui-control"
          value={(value as string) ?? ""}
          placeholder={q.placeholder}
          readOnly={readOnly}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "longtext":
      control = (
        <textarea
          id={id}
          className="ui-textarea ui-control"
          value={(value as string) ?? ""}
          placeholder={q.placeholder}
          readOnly={readOnly}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "number":
      control = (
        <input
          id={id}
          type="number"
          className="ui-input ui-control"
          value={value === undefined || value === null ? "" : String(value)}
          placeholder={q.placeholder}
          min={q.min}
          max={q.max}
          step={q.step}
          readOnly={readOnly}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      );
      break;
    case "boolean":
      control = (
        <label className="ui-survey__boolean">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            disabled={disabled || readOnly}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{q.title}</span>
        </label>
      );
      break;
    case "single":
    case "dropdown": {
      const cq = q as { choices: { value: string; label: string }[] };
      control = (
        <select
          id={id}
          className="ui-select ui-control"
          value={(value as string) ?? ""}
          disabled={disabled || readOnly}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{q.placeholder ?? "Select…"}</option>
          {cq.choices.map((c) => (
            <option key={c.value} value={c.value} disabled={false}>{c.label}</option>
          ))}
        </select>
      );
      break;
    }
    case "multiple": {
      const cq = q as { choices: { value: string; label: string }[] };
      const arr = Array.isArray(value) ? (value as string[]) : [];
      control = (
        <div className="ui-survey__choices" role="group" aria-labelledby={id}>
          {cq.choices.map((c) => (
            <label key={c.value} className="ui-survey__choice">
              <input
                type="checkbox"
                value={c.value}
                checked={arr.includes(c.value)}
                disabled={disabled || readOnly}
                onChange={(e) => {
                  const next = e.target.checked ? [...arr, c.value] : arr.filter((x) => x !== c.value);
                  onChange(next);
                }}
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      );
      break;
    }
    case "rating": {
      const rq = q as { max?: number };
      const max = rq.max ?? 5;
      control = (
        <div className="ui-survey__rating" role="radiogroup" aria-labelledby={id}>
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`ui-survey__star ${Number(value) >= n ? "ui-survey__star--filled" : ""}`}
              disabled={disabled || readOnly}
              aria-label={`${n} of ${max}`}
              aria-pressed={Number(value) === n}
              onClick={() => onChange(Number(value) === n ? 0 : n)}
            >
              ★
            </button>
          ))}
        </div>
      );
      break;
    }
    case "opinion": {
      const oq = q as { min?: number; max?: number; step?: number; minLabel?: string; maxLabel?: string };
      const min = oq.min ?? 1;
      const max = oq.max ?? 5;
      const step = oq.step ?? 1;
      const vals: number[] = [];
      for (let n = min; n <= max; n += step) vals.push(n);
      control = (
        <div className="ui-survey__opinion">
          {oq.minLabel && <span className="ui-survey__opinion-label">{oq.minLabel}</span>}
          <div className="ui-survey__opinion-scale" role="radiogroup" aria-labelledby={id}>
            {vals.map((n) => (
              <button
                key={n}
                type="button"
                className={`ui-survey__opinion-btn ${value === n ? "ui-survey__opinion-btn--active" : ""}`}
                disabled={disabled || readOnly}
                aria-pressed={value === n}
                onClick={() => onChange(n)}
              >
                {n}
              </button>
            ))}
          </div>
          {oq.maxLabel && <span className="ui-survey__opinion-label">{oq.maxLabel}</span>}
        </div>
      );
      break;
    }
    case "date":
    case "time":
    case "datetime":
      control = (
        <input
          id={id}
          type={q.type === "date" ? "date" : q.type === "time" ? "time" : "datetime-local"}
          className="ui-input ui-control"
          value={(value as string) ?? ""}
          readOnly={readOnly}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "content":
      control = <div className="ui-survey__content" dangerouslySetInnerHTML={{ __html: (q as { html?: string }).html ?? "" }} />;
      break;
    case "section":
      control = null;
      break;
    default:
      control = <span className="ui-survey__unsupported">Unsupported question type: {q.type}</span>;
  }

  if (q.type === "section") {
    const sq = q as { questions: SurveyQuestion[] };
    return (
      <fieldset className="ui-survey__section" disabled={disabled}>
        <legend className="ui-survey__section-title">{q.title}</legend>
        {q.description && <p className="ui-survey__description">{q.description}</p>}
        <div className="ui-survey__section-body">
          {sq.questions
            .filter((qq) => isVisible(qq, answers))
            .map((qq) => (
              <QuestionField
                key={qq.id}
                q={qq}
                value={answers[qq.id]}
                onChange={(v) => onChange(v)}
                error={null}
                readOnly={readOnly}
                disabled={disabled}
                answers={answers}
              />
            ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div className={`ui-survey__question ${error ? "ui-survey__question--error" : ""}`} data-question-id={q.id}>
      {q.type !== "boolean" && label}
      {desc}
      {control}
      {help}
      {err}
    </div>
  );
}

export function SurveyRenderer({
  schema,
  defaultValues,
  readOnly,
  disabled,
  onSubmit,
  onChange,
  className,
}: SurveyRendererProps) {
  const [answers, setAnswers] = useState<SurveyAnswers>(() => ({ ...defaultValues }));
  const [pageIndex, setPageIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const pages = schema.pages;
  const page = pages[pageIndex];

  const visibleQuestions = useMemo(() => {
    if (!page) return [];
    const out: SurveyQuestion[] = [];
    const walk = (qs: SurveyQuestion[]) => {
      for (const q of qs) {
        if (q.type === "section") {
          if (isVisible(q, answers)) {
            const sq = q as { questions: SurveyQuestion[] };
            for (const qq of sq.questions) if (isVisible(qq, answers)) out.push(qq);
          }
        } else if (isVisible(q, answers)) out.push(q);
      }
    };
    walk(page.questions);
    return out;
  }, [page, answers]);

  const setAnswer = useCallback((id: string, v: unknown) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: v };
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  const validatePage = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    let ok = true;
    for (const q of visibleQuestions) {
      const msg = validateQuestion(q, answers[q.id], answers);
      if (msg) { nextErrors[q.id] = msg; ok = false; }
    }
    setErrors(nextErrors);
    return ok;
  }, [visibleQuestions, answers]);

  const handleNext = useCallback(() => {
    if (!validatePage()) return;
    if (pageIndex < pages.length - 1) setPageIndex((i) => i + 1);
  }, [validatePage, pageIndex, pages.length]);

  const handleBack = useCallback(() => {
    if (schema.settings?.allowBack === false) return;
    if (pageIndex > 0) setPageIndex((i) => i - 1);
  }, [pageIndex, schema.settings]);

  const handleSubmit = useCallback((e?: FormEvent) => {
    e?.preventDefault();
    if (!validatePage()) return;
    setSubmitted(true);
    onSubmit?.(answers);
  }, [validatePage, answers, onSubmit]);

  if (!page) return null;

  const showProgress = schema.settings?.showProgressBar;
  const progress = pages.length > 1 ? ((pageIndex + 1) / pages.length) * 100 : 0;

  return (
    <form className={`ui-survey ${className ?? ""}`} onSubmit={handleSubmit} noValidate>
      {schema.title && <h2 className="ui-survey__title">{schema.title}</h2>}
      {schema.description && <p className="ui-survey__intro">{schema.description}</p>}
      {showProgress && (
        <div className="ui-survey__progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="ui-survey__progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
      {pages.length > 1 && (
        <div className="ui-survey__page-meta">
          Page {pageIndex + 1} of {pages.length}
          {page.title && <span className="ui-survey__page-title"> — {page.title}</span>}
        </div>
      )}
      {page.description && <p className="ui-survey__description">{page.description}</p>}

      <div className="ui-survey__body">
        {visibleQuestions.map((q) => (
          <QuestionField
            key={q.id}
            q={q}
            value={answers[q.id] ?? q.defaultValue}
            onChange={(v) => setAnswer(q.id, v)}
            error={errors[q.id]}
            readOnly={readOnly}
            disabled={disabled}
            answers={answers}
          />
        ))}
      </div>

      <div className="ui-survey__actions">
        {pageIndex > 0 && schema.settings?.allowBack !== false && (
          <button type="button" className="ui-button ui-button--ghost" onClick={handleBack}>Back</button>
        )}
        {pageIndex < pages.length - 1 ? (
          <button type="button" className="ui-button ui-button--primary" onClick={handleNext}>Next</button>
        ) : (
          <button type="submit" className="ui-button ui-button--primary" disabled={disabled || readOnly || submitted}>
            {schema.settings?.submitLabel ?? "Submit"}
          </button>
        )}
      </div>
      {submitted && <p className="ui-survey__submitted" role="status">Submitted. Thank you.</p>}
    </form>
  );
}

export function validateSurvey(schema: SurveySchema, answers: SurveyAnswers): SurveyValidationError[] {
  const out: SurveyValidationError[] = [];
  const walk = (qs: SurveyQuestion[]) => {
    for (const q of qs) {
      if (q.type === "section") { walk((q as { questions: SurveyQuestion[] }).questions); continue; }
      if (!isVisibleQuestion(q, answers)) continue;
      const msg = validateQuestion(q, answers[q.id], answers);
      if (msg) out.push({ questionId: q.id, message: msg });
    }
  };
  const isVisibleQuestion = (q: SurveyQuestion, a: SurveyAnswers) => evaluateCondition(q.visibleIf?.expression, { answers: a });
  for (const p of schema.pages) walk(p.questions);
  return out;
}
