// ユースケース層：ロール別のリダイレクトロジック

import { UserRole } from "../../_types/auth";

/**
 * ユーザーの役割に応じたリダイレクト先のパスを返す
 */
export function getRedirectPathByRole(role: string): string {
  const normalizedRole = role.toUpperCase() as UserRole;

  switch (normalizedRole) {
    case UserRole.ADMIN:
      return "/"; // 管理者はホームページ
    case UserRole.TEACHER:
      return "/teacher/dashboard"; // 教師用ダッシュボード
    case UserRole.STUDENT:
      return "/student/dashboard"; // 学生用ダッシュボード
    default:
      return "/"; // デフォルトはホームページ
  }
}
