import "./Select.css";

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
};

export default function Select({
  label,
  name,
  value,
  onChange,
  options,
}: SelectProps) {
  const selectId = `select-${name}`;

  return (
    <div className="field">
      <label className="fieldLabel" htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        className="selectInput"
      >
        <option value="">{label.toUpperCase()}</option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
