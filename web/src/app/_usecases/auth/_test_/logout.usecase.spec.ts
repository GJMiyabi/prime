import { LogoutUseCase } from '../logout.usecase';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;

  beforeEach(() => {
    useCase = new LogoutUseCase();
  });

  describe('execute', () => {
    it('常に/loginを返す', () => {
      const result = useCase.execute();

      expect(result).toBe('/login');
    });

    it('複数回実行しても同じ結果を返す', () => {
      const result1 = useCase.execute();
      const result2 = useCase.execute();

      expect(result1).toBe('/login');
      expect(result2).toBe('/login');
    });
  });
});
