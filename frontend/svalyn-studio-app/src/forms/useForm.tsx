/*
 * Copyright (c) 2023 Stéphane Bégaudeau.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { TextFieldProps } from '@mui/material/TextField';
import { useState } from 'react';
import { UseFormProps, UseFormState, UseFormValue, ValidationResult, ValidationRule } from './useForm.types';

export function useForm<FormDataType extends Object>({
  initialValue,
  validationRules,
}: UseFormProps<FormDataType>): UseFormValue<FormDataType> {
  const [state, setState] = useState<UseFormState<FormDataType>>({
    data: initialValue,
    validationState: {},
    isFormValid: false,
  });

  const reset = () => {
    setState((prevState) => ({ ...prevState, data: initialValue, validationState: {}, isFormValid: false }));
  };

  const getTextFieldProps = (name: keyof FormDataType, helperText?: string): TextFieldProps => {
    let error = false;
    let computedHelperText: string | undefined = helperText;

    const propertyValidationState = state.validationState[name];
    if (propertyValidationState) {
      error = !propertyValidationState.isPropertyValid;
      computedHelperText = error ? propertyValidationState.errorMessage ?? helperText : helperText;
    }

    return {
      value: state.data[name],
      helperText: computedHelperText,
      error,
      onChange: (event) => {
        const {
          target: { value },
        } = event;
        setState((prevState) => {
          const newData: FormDataType = { ...prevState.data, [name]: value };
          const newValidationState: { [FormDataProperty in keyof FormDataType]?: ValidationResult } = {
            ...prevState.validationState,
          };

          let isFormValid = true;
          if (validationRules) {
            isFormValid = validateForm(newData, validationRules);

            const propertyValidationRule = validationRules[name];
            if (propertyValidationRule) {
              newValidationState[name] = propertyValidationRule(newData);
            }
          }
          return { ...prevState, data: newData, validationState: newValidationState, isFormValid };
        });
      },
    };
  };

  return {
    data: state.data,
    isFormValid: state.isFormValid,
    reset,
    getTextFieldProps,
  };
}

function validateForm<FormDataType extends Object>(
  data: FormDataType,
  validationRules: { [FormDataProperty in keyof FormDataType]?: ValidationRule<FormDataType> }
): boolean {
  let isFormValid: boolean = true;
  for (const property in data) {
    const validationRule = validationRules[property];
    if (validationRule) {
      const validationResult = validationRule(data);
      isFormValid = isFormValid && validationResult.isPropertyValid;
    }
  }
  return isFormValid;
}

export const hasMinLength = (value: string, minLength: number): ValidationResult => {
  const isPropertyValid = value.length >= minLength;
  const errorMessage: string | null = isPropertyValid ? null : `${minLength} character(s) minimum required`;
  return {
    isPropertyValid,
    errorMessage,
  };
};

export const hasMaxLength = (value: string, maxLength: number): ValidationResult => {
  const isPropertyValid = value.length <= maxLength;
  const errorMessage: string | null = isPropertyValid ? null : `${maxLength} character(s) maximum required`;
  return {
    isPropertyValid,
    errorMessage,
  };
};

export const isIdentifier = (value: string): ValidationResult => {
  const isPropertyValid = new RegExp('^[A-Za-z0-9-_]+$').test(value);
  const errorMessage: string | null = isPropertyValid ? null : `Use only letters, numbers, dashes or underscores`;
  return {
    isPropertyValid,
    errorMessage,
  };
};
