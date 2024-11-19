import React from 'react';
import { Check, X } from 'lucide-react';

export function PasswordStrength({ password }) {
  const requirements = [
    {
      test: (pass) => pass.length >= 8,
      text: 'At least 8 characters',
    },
    {
      test: (pass) => /[A-Z]/.test(pass),
      text: 'One uppercase letter',
    },
    {
      test: (pass) => /[a-z]/.test(pass),
      text: 'One lowercase letter',
    },
    {
      test: (pass) => /[0-9]/.test(pass),
      text: 'One number',
    },
    {
      test: (pass) => /[^A-Za-z0-9]/.test(pass),
      text: 'One special character',
    },
  ];

  const strengthScore = requirements.reduce(
    (score, req) => score + (req.test(password) ? 1 : 0),
    0
  );

  const getStrengthColor = () => {
    if (strengthScore <= 2) return 'bg-red-500/20';
    if (strengthScore <= 4) return 'bg-yellow-500/20';
    return 'bg-green-500/20';
  };

  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${(strengthScore / requirements.length) * 100}%` }}
        />
      </div>

      <ul className="grid grid-cols-2 gap-2 text-sm">
        {requirements.map((req, index) => {
          const passes = req.test(password);
          return (
            <li
              key={index}
              className={`flex items-center gap-2 ${
                passes ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              {passes ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 flex-shrink-0" />
              )}
              {req.text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
