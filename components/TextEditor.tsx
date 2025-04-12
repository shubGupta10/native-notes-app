import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, TextInput } from 'react-native';

interface TextEditorProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export interface TextEditorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

const TextEditor = forwardRef<TextEditorRef, TextEditorProps>(
  ({ value, onChange, placeholder = "Write your note here..." }, ref) => {
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
      clear: () => {
        inputRef.current?.clear();
        onChange("");
      },
    }));

    return (
      <View className="rounded-xl border border-gray-300 overflow-hidden">
        <TextInput
          ref={inputRef}
          className="p-4 bg-white text-gray-800 text-base"
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          style={{ minHeight: 200 }}
        />
      </View>
    );
  }
);

export default TextEditor;