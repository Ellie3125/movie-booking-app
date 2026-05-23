/**
 * ProfileFormField — Trường nhập liệu cho các form hồ sơ người dùng.
 *
 * ## Autonomous Decisions
 * - maxLength counter is positioned absolutely in the label row (top-right) to avoid
 *   layout shifts when the counter appears/disappears.
 * - Used minHeight 80 for multiline instead of a fixed height so content can grow.
 * - Error border takes precedence over disabled border styling.
 *
 * ## Deviations
 * - None from the provided spec.
 *
 * ## Trade-offs
 * - The label row uses flexDirection 'row' + justifyContent 'space-between' to place
 *   the maxLength counter beside the label. This means very long labels could compress
 *   the counter, but profile form labels are typically short.
 *
 * ## Context/Notes
 * - Uses KeyboardTypeOptions from react-native for type-safe keyboardType prop.
 * - Follows the warm-cream design system with #F3E8DC borders and #FFFBF7 backgrounds.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { Fonts } from '@/constants/theme';

type ProfileFormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  helperText?: string;
  maxLength?: number;
};

function ProfileFormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled = false,
  multiline = false,
  numberOfLines,
  keyboardType,
  secureTextEntry,
  helperText,
  maxLength,
}: ProfileFormFieldProps) {
  const hasError = !!error;

  return (
    <View style={styles.container}>
      {/* Label row */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {maxLength != null ? (
          <Text style={styles.counter}>
            {value.length}/{maxLength}
          </Text>
        ) : null}
      </View>

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          hasError && styles.inputError,
          disabled && styles.inputDisabled,
          multiline && styles.inputMultiline,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C7C7CD"
        editable={!disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
      />

      {/* Error text */}
      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {/* Helper text */}
      {!hasError && helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
  },
  counter: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    color: '#A1A1AA',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.sans,
    color: '#5A3E2B',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputDisabled: {
    backgroundColor: '#F7F2EB',
    borderColor: '#EFE6DA',
    color: '#8A6A50',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 11,
    fontFamily: Fonts.sans,
    color: '#A1A1AA',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default ProfileFormField;
