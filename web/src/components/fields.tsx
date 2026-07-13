"use client";

/**
 * Form field primitives shared by every calculator: CurrencyInput, RateInput,
 * TermSelector, CompoundingSelector, and generic Select. All are
 * forwardRef-compatible with react-hook-form's register(), pair labels to
 * inputs, and surface validation errors via aria-describedby so screen
 * readers announce them.
 */

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { COMPOUNDING_LABELS } from "@/lib/finance";

interface FieldChromeProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: (ids: { inputId: string; describedBy?: string }) => ReactNode;
}

function FieldChrome({ label, error, hint, children }: FieldChromeProps) {
  const inputId = useId();
  const messageId = useId();
  const describedBy = error || hint ? messageId : undefined;
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      {children({ inputId, describedBy })}
      {error ? (
        <p id={messageId} role="alert" className="text-sm text-negative">
          {error}
        </p>
      ) : hint ? (
        // div, not p: hints may contain block-level content such as the
        // <details>-based EducationalTooltip, which is invalid inside <p>.
        <div id={messageId} className="text-xs text-muted">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border bg-surface px-3 py-2 text-sm tabular-nums " +
  "focus:border-primary disabled:opacity-50";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

/** Monetary input with a currency-symbol prefix. */
export const CurrencyInput = forwardRef<HTMLInputElement, InputProps & { symbol?: string }>(
  function CurrencyInput({ label, error, hint, symbol = "$", ...props }, ref) {
    return (
      <FieldChrome label={label} error={error} hint={hint}>
        {({ inputId, describedBy }) => (
          <div className="relative">
            <span aria-hidden className="absolute inset-y-0 left-3 flex items-center text-muted">
              {symbol}
            </span>
            <input
              ref={ref}
              id={inputId}
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              className={`${inputClass} pl-7`}
              {...props}
            />
          </div>
        )}
      </FieldChrome>
    );
  },
);

/** Percentage input with a % suffix. */
export const RateInput = forwardRef<HTMLInputElement, InputProps>(function RateInput(
  { label, error, hint, ...props },
  ref,
) {
  return (
    <FieldChrome label={label} error={error} hint={hint}>
      {({ inputId, describedBy }) => (
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`${inputClass} pr-8`}
            {...props}
          />
          <span aria-hidden className="absolute inset-y-0 right-3 flex items-center text-muted">
            %
          </span>
        </div>
      )}
    </FieldChrome>
  );
});

/** Whole-months input, with a year hint for long terms. */
export const TermSelector = forwardRef<HTMLInputElement, InputProps>(function TermSelector(
  { label, error, hint, ...props },
  ref,
) {
  return (
    <FieldChrome label={label} error={error} hint={hint}>
      {({ inputId, describedBy }) => (
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="number"
            inputMode="numeric"
            step={1}
            min={1}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`${inputClass} pr-14`}
            {...props}
          />
          <span aria-hidden className="absolute inset-y-0 right-3 flex items-center text-xs text-muted">
            months
          </span>
        </div>
      )}
    </FieldChrome>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  options: { value: string | number; label: string }[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, ...props },
  ref,
) {
  return (
    <FieldChrome label={label} error={error} hint={hint}>
      {({ inputId, describedBy }) => (
        <select
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={inputClass}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldChrome>
  );
});

export const CompoundingSelector = forwardRef<
  HTMLSelectElement,
  Omit<SelectProps, "options">
>(function CompoundingSelector(props, ref) {
  const options = Object.entries(COMPOUNDING_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  return <Select ref={ref} options={options} {...props} />;
});
