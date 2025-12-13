'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export function InputField({
  label,
  name,
  type = 'text',
  required = false,
  error,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  rows,
}: InputFieldProps) {
  const isTextarea = rows && rows > 1;
  const Component = isTextarea ? 'textarea' : 'input';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <label htmlFor={name} className="label-spa">
        {label}
        {required && <span className="text-spa-rose-500 ml-1">*</span>}
      </label>
      <Component
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`input-spa ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''} ${
          isTextarea ? 'resize-none' : ''
        }`}
      />
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-red-600 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SelectField({
  label,
  name,
  required = false,
  error,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = '',
}: SelectFieldProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <label htmlFor={name} className="label-spa">
        {label}
        {required && <span className="text-spa-rose-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`input-spa ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 text-red-600 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  className = '',
}: CheckboxFieldProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 ${className}`}
    >
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox-spa"
      />
      <label htmlFor={name} className="text-sm text-gray-700 cursor-pointer select-none">
        {label}
      </label>
    </motion.div>
  );
}

interface RadioFieldProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export function RadioField({
  label,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  className = '',
}: RadioFieldProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 ${className}`}
    >
      <input
        type="radio"
        id={`${name}-${value}`}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-5 h-5 text-spa-rose-500 border-2 border-gray-300 focus:ring-2 focus:ring-spa-rose-300"
      />
      <label htmlFor={`${name}-${value}`} className="text-sm text-gray-700 cursor-pointer select-none">
        {label}
      </label>
    </motion.div>
  );
}
