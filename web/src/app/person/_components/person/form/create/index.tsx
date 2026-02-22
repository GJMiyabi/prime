"use client";
import React from "react";
import { usePersonCreate } from "@/app/_hooks/person/usePersonCreate";
import * as CONSTANTS from "@/app/person/_constants";

type Props = {
  facilityId?: string | undefined;
  organizationId?: string | undefined;
};

/**
 * Person作成フォームコンポーネント
 * React Hook Formで完全に制御され、バリデーションは_schemasで一元管理
 */
const PersonCreateForm: React.FC<Props> = () => {
  const { form, onSubmit, isSubmitting } = usePersonCreate();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={onSubmit}
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
          {...register("name")}
          disabled={isSubmitting}
          aria-required="true"
          aria-invalid={errors.name ? "true" : "false"}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
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
          {...register("value")}
          disabled={isSubmitting}
          aria-required="true"
          aria-invalid={errors.value ? "true" : "false"}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {errors.value && (
          <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>
        )}
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
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
