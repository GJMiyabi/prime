"use client";
import React from "react";
import { usePersonCreateForm } from "@/app/_hooks/person/form/usePersonCreateForm";
import * as CONSTANTS from "@/app/person/_constants";

type Props = {
  facilityId?: string | undefined;
  organizationId?: string | undefined;
};

/**
 * Person作成フォームコンポーネント
 * プレゼンテーション層：UIの表示とユーザー入力の受付のみを担当
 * ビジネスロジックはusePersonCreateFormに委譲
 */
const PersonCreateForm: React.FC<Props> = () => {
  const {
    name,
    value,
    setName,
    setValue,
    handleSubmit,
    loading,
    error,
  } = usePersonCreateForm();

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white shadow rounded w-full max-w-md mx-auto"
      noValidate
    >
      {/* ヘッダー */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {CONSTANTS.LABEL_PROFILE}作成
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          新しい{CONSTANTS.LABEL_PROFILE}情報を入力してください
        </p>
      </div>

      {/* エラーメッセージ（グローバル） */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* 名前フィールド */}
      <div className="flex flex-col">
        <label
          htmlFor="person-name"
          className="mb-1 font-semibold text-gray-700"
        >
          {CONSTANTS.LABEL_NAME_EN}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="person-name"
          type="text"
          placeholder={CONSTANTS.LABEL_NAME_EN}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          required
          aria-required="true"
          aria-invalid={!name && error ? "true" : "false"}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {!name && error && (
          <p className="text-red-500 text-xs mt-1">名前は必須です</p>
        )}
      </div>

      {/* 値フィールド */}
      <div className="flex flex-col">
        <label
          htmlFor="person-value"
          className="mb-1 font-semibold text-gray-700"
        >
          {CONSTANTS.LABEL_VALUE}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="person-value"
          type="text"
          placeholder={CONSTANTS.LABEL_VALUE}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading}
          required
          aria-required="true"
          aria-invalid={!value && error ? "true" : "false"}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {!value && error && (
          <p className="text-red-500 text-xs mt-1">値は必須です</p>
        )}
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {CONSTANTS.ACTION_SAVING}
          </>
        ) : (
          CONSTANTS.ACTION_SUBMIT
        )}
      </button>

      {/* フォームヘルプテキスト */}
      <p className="text-xs text-gray-500 text-center">
        <span className="text-red-500">*</span> は必須項目です
      </p>
    </form>
  );
};

export default PersonCreateForm;
