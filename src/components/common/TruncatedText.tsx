import type { CSSProperties } from 'react';
import { Tooltip } from 'antd';

interface TruncatedTextProps {
  text: string;
  /** Max width in px (number) or any CSS length string. Default: 200px */
  maxWidth?: number | string;
  className?: string;
}

const baseStyle: CSSProperties = {
  display: 'inline-block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  verticalAlign: 'bottom',
};

/**
 * Renders text with CSS ellipsis truncation and an Ant Design Tooltip that
 * reveals the full string on hover. The complete text is always present in
 * the DOM, so screen readers see the unclipped value.
 */
export function TruncatedText({ text, maxWidth = 200, className }: TruncatedTextProps) {
  const style: CSSProperties = {
    ...baseStyle,
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
  };

  return (
    <Tooltip title={text} mouseEnterDelay={0.4}>
      <span style={style} className={className}>
        {text}
      </span>
    </Tooltip>
  );
}
