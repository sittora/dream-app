import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const requirements = [
    { regex: /.{8,}/, label: 'At least 8 characters' },
    { regex: /[A-Z]/, label: 'One uppercase letter' },
    { regex: /[a-z]/, label: 'One lowercase letter' },
    { regex: /[0-9]/, label: 'One number' },
    { regex: /[^A-Za-z0-9]/, label: 'One special character' },
  ];

  const strength = requirements.reduce((count, req) => 
    count + (req.regex.test(password) ? 1 : 0), 0
  );

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${(strength / requirements.length) * 100}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`text-xs flex items-center gap-1 ${
              req.regex.test(password) ? 'text-green-500' : 'text-gray-400'
            }`}
          >
            <div className={`w-1 h-1 rounded-full ${
              req.regex.test(password) ? 'bg-green-500' : 'bg-gray-600'
            }`} />
            {req.label}
          </div>
        ))}
      </div>
    </div>
  );
};
