import React from 'react';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange }) => {
  const languages = [
    { code: 'es-US', name: 'Spanish (America)' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'he-IL', name: 'Hebrew (Israel)' }
  ];

  return (
    <div className="mb-4">
      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
        Language
      </label>
      <select
        id="language"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;