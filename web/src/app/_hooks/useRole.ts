/**
 * 役割ベースアクセス制御（RBAC）フック
 * ユーザーの役割に基づいてUI表示や機能アクセスを制御
 */

import { useAuth } from "../_contexts/auth-context";
import { UserRole, RoleLevel } from "../_types/auth";

/**
 * useRole フック
 * 
 * 使用例:
 * ```typescript
 * const { hasRole, isAdmin, isTeacher, role } = useRole();
 * 
 * if (isAdmin) {
 *   // 管理者のみ表示
 *   return <AdminPanel />;
 * }
 * 
 * if (hasRole(UserRole.TEACHER)) {
 *   // 教師以上の権限を持つユーザーのみ
 *   return <TeacherFeature />;
 * }
 * ```
 */
export function useRole() {
  const { user } = useAuth();

  /**
   * 現在のユーザーの役割
   */
  const role = user?.role as UserRole | undefined;

  /**
   * 指定された役割を持っているか確認
   * @param requiredRole - 必要な役割
   * @returns 役割を持っている場合 true
   */
  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    return role === requiredRole;
  };

  /**
   * 指定された役割以上の権限を持っているか確認
   * @param minRole - 最低限必要な役割
   * @returns 権限を持っている場合 true
   */
  const hasMinRole = (minRole: UserRole): boolean => {
    if (!role) return false;
    return RoleLevel[role] >= RoleLevel[minRole];
  };

  /**
   * 指定された役割のいずれかを持っているか確認
   * @param roles - 許可される役割のリスト
   * @returns いずれかの役割を持っている場合 true
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!role) return false;
    return roles.includes(role);
  };

  /**
   * 管理者かどうか
   */
  const isAdmin = hasRole(UserRole.ADMIN);

  /**
   * 教師かどうか
   */
  const isTeacher = hasRole(UserRole.TEACHER);

  /**
   * 学生かどうか
   */
  const isStudent = hasRole(UserRole.STUDENT);

  /**
   * 関係者かどうか
   */
  const isStakeholder = hasRole(UserRole.STAKEHOLDER);

  return {
    role,
    hasRole,
    hasMinRole,
    hasAnyRole,
    isAdmin,
    isTeacher,
    isStudent,
    isStakeholder,
  };
}
