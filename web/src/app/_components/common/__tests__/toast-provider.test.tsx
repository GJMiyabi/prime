/**
 * ToastProviderコンポーネントのテスト
 */

import { render, screen } from '@testing-library/react';
import { ToastProvider } from '../toast-provider';
import toast from 'react-hot-toast';

describe('ToastProvider', () => {
  beforeEach(() => {
    // 各テストの前にtoastをクリア
    toast.remove();
  });

  describe('レンダリング', () => {
    it('ToastProviderが正常にレンダリングされる', () => {
      const { container } = render(<ToastProvider />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Toast表示', () => {
    it('成功メッセージが表示される', async () => {
      render(<ToastProvider />);
      
      toast.success('成功しました');

      // react-hot-toastのメッセージを探す
      const message = await screen.findByText('成功しました');
      expect(message).toBeInTheDocument();
    });

    it('エラーメッセージが表示される', async () => {
      render(<ToastProvider />);
      
      toast.error('エラーが発生しました');

      const message = await screen.findByText('エラーが発生しました');
      expect(message).toBeInTheDocument();
    });
  });
});
