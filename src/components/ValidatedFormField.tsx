import { useState, useEffect, useId } from 'react';
import { Check, AlertCircle, HelpCircle, DollarSign, Percent } from 'lucide-react';
import { FieldConfig, validateField, formatInput, ValidationResult } from '../lib/document-validation';

interface ValidatedFormFieldProps {
  config: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  allValues?: Record<string, string>;
  showValidation?: boolean;
}

export default function ValidatedFormField({
  config,
  value,
  onChange,
  allValues = {},
  showValidation = true
}: ValidatedFormFieldProps) {
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, error: null });
  const [showHelper, setShowHelper] = useState(false);
  const inputId = useId();
  const errorId = useId();
  const helperId = useId();

  useEffect(() => {
    if (touched || value) {
      const result = validateField(value, config, allValues);
      setValidation(result);
    }
  }, [value, config, allValues, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    if (config.type === 'phone' || config.type === 'currency' || config.type === 'percentage') {
      newValue = formatInput(newValue, config.type);
    }

    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const showError = touched && !validation.isValid && showValidation;
  const showSuccess = touched && validation.isValid && value.trim() && showValidation;

  const baseInputClasses = `
    w-full px-4 py-2.5 border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2
    ${showError
      ? 'border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50'
      : showSuccess
        ? 'border-green-300 focus:ring-green-200 focus:border-green-400 bg-green-50'
        : 'border-slate-300 focus:ring-blue-200 focus:border-blue-400'}
  `;

  const renderInput = () => {
    const commonProps = {
      id: inputId,
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      placeholder: config.placeholder,
      'aria-describedby': `${helperId} ${showError ? errorId : ''}`.trim(),
      'aria-invalid': showError,
      'aria-required': config.required
    };

    if (config.type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={3}
          className={`${baseInputClasses} resize-none`}
        />
      );
    }

    if (config.type === 'date') {
      return (
        <input
          {...commonProps}
          type="date"
          className={baseInputClasses}
        />
      );
    }

    if (config.type === 'currency') {
      return (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <input
            {...commonProps}
            type="text"
            inputMode="decimal"
            className={`${baseInputClasses} pl-9`}
          />
        </div>
      );
    }

    if (config.type === 'percentage') {
      return (
        <div className="relative">
          <input
            {...commonProps}
            type="text"
            inputMode="decimal"
            className={`${baseInputClasses} pr-9`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Percent className="w-4 h-4" />
          </div>
        </div>
      );
    }

    return (
      <input
        {...commonProps}
        type={config.type === 'email' ? 'email' : config.type === 'phone' ? 'tel' : 'text'}
        className={baseInputClasses}
      />
    );
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700"
        >
          {config.label}
          {config.required && (
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          )}
        </label>
        {config.helperText && (
          <button
            type="button"
            onClick={() => setShowHelper(!showHelper)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
            aria-label={`Help for ${config.label}`}
            aria-expanded={showHelper}
            aria-controls={helperId}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {showHelper && config.helperText && (
        <div
          id={helperId}
          className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-start gap-2"
          role="tooltip"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>{config.helperText}</span>
        </div>
      )}

      <div className="relative">
        {renderInput()}

        {showValidation && (showError || showSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {config.type !== 'percentage' && (
              <>
                {showError && <AlertCircle className="w-5 h-5 text-red-500" />}
                {showSuccess && <Check className="w-5 h-5 text-green-500" />}
              </>
            )}
          </div>
        )}
      </div>

      {showError && (
        <p
          id={errorId}
          data-testid="field-error"
          className="text-xs text-red-600 flex items-center gap-1 mt-1"
          role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {validation.error}
        </p>
      )}

      {!showHelper && !showError && config.helperText && (
        <p id={helperId} className="text-xs text-slate-500 mt-1">
          {config.helperText}
        </p>
      )}
    </div>
  );
}
