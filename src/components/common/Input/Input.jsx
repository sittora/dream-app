import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const inputVariants = {
  focus: { scale: 1.02 },
  blur: { scale: 1 }
};

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  icon,
  required = false,
  className = '',
  fullWidth = false,
  helperText,
  showPasswordToggle = false,
  onTogglePassword,
  ...props
}, ref) => {
  const baseClasses = 'block rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 font-cormorant text-lg';
  const errorClasses = error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : '';
  const widthClasses = fullWidth ? 'w-full' : 'w-auto';
  
  const inputClasses = [
    baseClasses,
    errorClasses,
    widthClasses,
    'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100',
    className
  ].join(' ');

  const labelClasses = [
    'block text-sm font-cinzel mb-1',
    error ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'
  ].join(' ');

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={props.id || props.name} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <motion.div
          variants={inputVariants}
          initial="blur"
          whileFocus="focus"
        >
          <input
            ref={ref}
            type={type}
            className={`
              ${inputClasses}
              ${icon ? 'pl-10' : ''}
              ${showPasswordToggle ? 'pr-10' : ''}
            `}
            {...props}
          />
        </motion.div>

        {showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={onTogglePassword}
          >
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              {type === 'password' ? (
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              ) : (
                <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
              )}
            </svg>
          </button>
        )}
      </div>

      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.node,
  required: PropTypes.bool,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  helperText: PropTypes.string,
  showPasswordToggle: PropTypes.bool,
  onTogglePassword: PropTypes.func,
  id: PropTypes.string,
  name: PropTypes.string
};

export default Input;
