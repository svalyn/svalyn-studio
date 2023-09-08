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

export interface UseFormProps<FormDataType extends Object> {
  initialValue: FormDataType;
  validationRules?: { [FormDataProperty in keyof FormDataType]?: ValidationRule<FormDataType> };
}

export interface UseFormValue<FormDataType extends Object> {
  data: FormDataType;
  isFormValid: boolean;
  reset: () => void;
  getTextFieldProps: (name: keyof FormDataType, helperText?: string) => TextFieldProps;
}

export type ValidationRule<FormDataType extends Object> = (data: FormDataType) => ValidationResult;

export interface ValidationResult {
  isPropertyValid: boolean;
  errorMessage: string | null;
}

export interface UseFormState<FormDataType extends Object> {
  data: FormDataType;
  validationState: { [FormDataProperty in keyof FormDataType]?: ValidationResult };
  isFormValid: boolean;
}
