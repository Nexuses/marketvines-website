'use client';

interface TextBlockProps {
  content: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  align?: 'left' | 'center' | 'right';
  isDarkBg?: boolean;
  className?: string;
}

export default function TextBlock({
  content,
  maxWidth = 'full',
  align = 'left',
  isDarkBg = false,
  className = '',
}: TextBlockProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'w-full',
  }[maxWidth];

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const textClass = isDarkBg ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className={`${maxWidthClass} ${alignClass} ${textClass} ${className}`}>
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="prose prose-sm max-w-none"
      />
    </div>
  );
}
