// フレームワーク層：Personフォーム専用カスタムフック

import { useState, FormEvent } from "react";
import { usePersonCreate } from "../usePersonCreate";

/**
 * Person作成フォームの状態管理とバリデーションを扱うカスタムフック
 * プレゼンテーション層のフォームロジックを担当
 */
export function usePersonCreateForm() {
  // フォームフィールドの状態
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  // ビジネスロジック層のフック（UseCase呼び出し）
  const { executeCreate, isLoading, error } = usePersonCreate();

  /**
   * フォームのバリデーション
   */
  const validateForm = (): { isValid: boolean; errorMessage?: string } => {
    if (!name.trim()) {
      return {
        isValid: false,
        errorMessage: "名前を入力してください。",
      };
    }

    if (!value.trim()) {
      return {
        isValid: false,
        errorMessage: "値を入力してください。",
      };
    }

    if (name.length < 2) {
      return {
        isValid: false,
        errorMessage: "名前は2文字以上で入力してください。",
      };
    }

    if (name.length > 100) {
      return {
        isValid: false,
        errorMessage: "名前は100文字以内で入力してください。",
      };
    }

    return { isValid: true };
  };

  /**
   * フォーム送信ハンドラー
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // クライアントサイドバリデーション
    const validation = validateForm();
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    // UseCase層を通じてPerson作成を実行
    const success = await executeCreate({
      name: name.trim(),
      value: value.trim(),
    });

    // 成功時はフォームをリセット（リダイレクトするため通常は不要だが念のため）
    if (success) {
      setName("");
      setValue("");
    }
  };

  /**
   * フォームをリセット
   */
  const resetForm = () => {
    setName("");
    setValue("");
  };

  return {
    // フォームフィールドの状態
    name,
    value,
    setName,
    setValue,
    
    // フォーム操作
    handleSubmit,
    resetForm,
    
    // ビジネスロジック層からの状態
    loading: isLoading,
    error,
  };
}
