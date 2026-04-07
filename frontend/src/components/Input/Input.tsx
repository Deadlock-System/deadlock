import { useState } from "react";
import "./Input.css";

type InputProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
  onFocus,
  onBlur,
}: InputProps) {
  const inputId = `input-${name}`;
  const isPassword = type === "password";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const actualType = isPassword && passwordVisible ? "text" : type;

  return (
    <div className="field">
      <label className="fieldLabel" htmlFor={inputId}>
        {label}
      </label>
      <div className="textInputWrap">
        <input
          id={inputId}
          type={actualType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={isPassword ? "textInput textInputWithToggle" : "textInput"}
          disabled={disabled}
          readOnly={readOnly}
        />

        {isPassword ? (
          <button
            type="button"
            className="passwordToggle"
            onClick={() => setPasswordVisible((prev) => !prev)}
            aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
            disabled={disabled}
          >
            {passwordVisible ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94" />
                <path d="M1 1l22 22" />
                <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
                <path d="M14.12 14.12 9.88 9.88" />
                <path d="M9.5 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-3.87 5.19" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              </svg>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
