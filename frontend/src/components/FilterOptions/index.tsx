import { useState } from 'react';

interface optionsProps {
  options: string[];
}

export default function FilterBar({ options }: optionsProps) {
  const [selected, setSelected] = useState('');

  const hoverStyle = 'hover:bg-gray-200';
  const selectedStyle = 'bg-gray-900 text-white';

  function setOptionStyle(element: string) {
    return `${selected === element ? selectedStyle : hoverStyle} rounded-2xl p-3`;
  }

  return (
    <div className="flex p-2 gap-3">
      {options.map((element) => (
        <button
          onClick={() => setSelected(element)}
          className={setOptionStyle(element)}
        >
          <span>{element}</span>
        </button>
      ))}
    </div>
  );
}
