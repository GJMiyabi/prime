/**
 * エラーメッセージ定数
 * アプリケーション全体で使用するエラーメッセージを一元管理
 */

export const ERROR_MESSAGES = {
  // Person関連
  PERSON: {
    NOT_FOUND: "Personが見つかりませんでした",
    FETCH_FAILED: "Personの取得に失敗しました",
    CREATE_FAILED: "Personの作成に失敗しました",
    DELETE_FAILED: "Personの削除に失敗しました",
    UPDATE_FAILED: "Personの更新に失敗しました",
    ID_REQUIRED: "IDは必須です",
    NAME_REQUIRED: "名前は必須です",
    VALUE_REQUIRED: "値は必須です",
  },

  // 認証関連
  AUTH: {
    LOGIN_FAILED: "ログインに失敗しました。ユーザー名またはパスワードが正しくありません",
    LOGOUT_FAILED: "ログアウトに失敗しました",
    UNAUTHORIZED: "認証されていません",
    TOKEN_EXPIRED: "セッションの有効期限が切れました",
    TOKEN_INVALID: "無効なトークンです",
  },

  // Organization関連
  ORGANIZATION: {
    NOT_FOUND: "Organizationが見つかりませんでした",
    FETCH_FAILED: "Organizationの取得に失敗しました",
    CREATE_FAILED: "Organizationの作成に失敗しました",
    DELETE_FAILED: "Organizationの削除に失敗しました",
    UPDATE_FAILED: "Organizationの更新に失敗しました",
  },

  // Facility関連
  FACILITY: {
    NOT_FOUND: "Facilityが見つかりませんでした",
    FETCH_FAILED: "Facilityの取得に失敗しました",
    CREATE_FAILED: "Facilityの作成に失敗しました",
    DELETE_FAILED: "Facilityの削除に失敗しました",
    UPDATE_FAILED: "Facilityの更新に失敗しました",
  },

  // 共通エラー
  COMMON: {
    NETWORK_ERROR: "ネットワークエラーが発生しました",
    SERVER_ERROR: "サーバーエラーが発生しました",
    UNKNOWN_ERROR: "予期しないエラーが発生しました",
    VALIDATION_ERROR: "入力内容に誤りがあります",
    TIMEOUT_ERROR: "リクエストがタイムアウトしました",
  },
} as const;
