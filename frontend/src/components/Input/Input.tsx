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

  return (
    <div className="field">
      <label className="fieldLabel" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="textInput"
        disabled={disabled}
        readOnly={readOnly}
      />
    </div>
  );
}
