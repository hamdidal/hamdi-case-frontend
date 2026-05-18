import { App } from 'antd';
import { useCallback } from 'react';
import type { ReactNode } from 'react';

export interface ConfirmOptions {
  title: string;
  content?: ReactNode;
  okText?: string;
  cancelText?: string;
  /** 'danger' renders a red OK button (deletes). 'warning' is neutral (discards). */
  type?: 'danger' | 'warning';
  /** Async callback passed directly to Antd onOk — the modal's OK button shows a
   *  native loading spinner while the promise is in-flight and closes on resolve. */
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
        // Antd treats a Promise returned from onOk as a loading signal:
        // the OK button spins until it resolves, preventing double-submits.
        onOk: onConfirm,
        autoFocusButton: type === 'danger' ? 'cancel' : 'ok',
      });
    },
    [modal],
  );
}
