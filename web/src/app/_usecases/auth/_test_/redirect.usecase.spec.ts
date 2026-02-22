import { getRedirectPathByRole } from '../redirect.usecase';
import { UserRole } from '../../../_types/auth';

describe('redirect.usecase', () => {
  describe('getRedirectPathByRole', () => {
    describe('ADMIN', () => {
      it('ADMINロールの場合は/を返す', () => {
        const result = getRedirectPathByRole('ADMIN');

        expect(result).toBe('/');
      });

      it('小文字のadminでも/を返す', () => {
        const result = getRedirectPathByRole('admin');

        expect(result).toBe('/');
      });

      it('大文字小文字混在のAdminでも/を返す', () => {
        const result = getRedirectPathByRole('Admin');

        expect(result).toBe('/');
      });

      it('UserRole.ADMINで/を返す', () => {
        const result = getRedirectPathByRole(UserRole.ADMIN);

        expect(result).toBe('/');
      });
    });

    describe('TEACHER', () => {
      it('TEACHERロールの場合は/teacher/dashboardを返す', () => {
        const result = getRedirectPathByRole('TEACHER');

        expect(result).toBe('/teacher/dashboard');
      });

      it('小文字のteacherでも/teacher/dashboardを返す', () => {
        const result = getRedirectPathByRole('teacher');

        expect(result).toBe('/teacher/dashboard');
      });

      it('大文字小文字混在のTeacherでも/teacher/dashboardを返す', () => {
        const result = getRedirectPathByRole('Teacher');

        expect(result).toBe('/teacher/dashboard');
      });

      it('UserRole.TEACHERで/teacher/dashboardを返す', () => {
        const result = getRedirectPathByRole(UserRole.TEACHER);

        expect(result).toBe('/teacher/dashboard');
      });
    });

    describe('STUDENT', () => {
      it('STUDENTロールの場合は/student/dashboardを返す', () => {
        const result = getRedirectPathByRole('STUDENT');

        expect(result).toBe('/student/dashboard');
      });

      it('小文字のstudentでも/student/dashboardを返す', () => {
        const result = getRedirectPathByRole('student');

        expect(result).toBe('/student/dashboard');
      });

      it('大文字小文字混在のStudentでも/student/dashboardを返す', () => {
        const result = getRedirectPathByRole('Student');

        expect(result).toBe('/student/dashboard');
      });

      it('UserRole.STUDENTで/student/dashboardを返す', () => {
        const result = getRedirectPathByRole(UserRole.STUDENT);

        expect(result).toBe('/student/dashboard');
      });
    });

    describe('不明なロール', () => {
      it('不明なロールの場合はデフォルトで/を返す', () => {
        const result = getRedirectPathByRole('UNKNOWN');

        expect(result).toBe('/');
      });

      it('空文字列の場合はデフォルトで/を返す', () => {
        const result = getRedirectPathByRole('');

        expect(result).toBe('/');
      });

      it('GUESTロールの場合はデフォルトで/を返す', () => {
        const result = getRedirectPathByRole('GUEST');

        expect(result).toBe('/');
      });
    });
  });
});
