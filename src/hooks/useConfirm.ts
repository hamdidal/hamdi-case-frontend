import { App } from 'antd';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

export interface ConfirmOptions {
  title: string;
  content?: ReactNode;
  okText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
  onConfirm: () => Promise<void>;
}

export type ShowConfirm = (options: ConfirmOptions) => void;

export function useConfirm(): ShowConfirm {
  const { modal } = App.useApp();

  return useCallback(
    ({
      title,
      content,
      okText = 'OK',
      cancelText = 'Cancel',
      type = 'warning',
      onConfirm,
    }: ConfirmOptions): void => {
      modal.confirm({
        title,
        content,
        okText,
        cancelText,
        okButtonProps: type === 'danger' ? { danger: true } : undefined,
        onOk: onConfirm,
        autoFocusButton: type === 'danger' ? 'cancel' : 'ok',
      });
    },
    [modal],
  );
}
