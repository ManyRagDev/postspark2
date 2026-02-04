import { forwardRef, TextareaHTMLAttributes, useEffect, useRef } from 'react';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    autoResize?: boolean;
    minHeight?: number;
    maxHeight?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
            autoResize = true,
            minHeight = 120,
            maxHeight = 400,
            className = '',
            style,
            onChange,
            ...props
        },
        ref
    ) => {
        const internalRef = useRef<HTMLTextAreaElement>(null);
        const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

        // Auto resize logic
        useEffect(() => {
            if (!autoResize || !textareaRef.current) return;

            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
            textarea.style.height = `${newHeight}px`;
        }, [props.value, autoResize, minHeight, maxHeight, textareaRef]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (autoResize && textareaRef.current) {
                const textarea = textareaRef.current;
                textarea.style.height = 'auto';
                const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
                textarea.style.height = `${newHeight}px`;
            }
            onChange?.(e);
        };

        return (
            <textarea
                ref={textareaRef}
                className={`
          w-full
          bg-white/5 
          border border-white/10 
          rounded-xl
          px-4 py-3
          text-white text-lg
          placeholder:text-white/40
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
          resize-none
          transition-all duration-200
          ${className}
        `}
                style={{
                    minHeight: `${minHeight}px`,
                    maxHeight: `${maxHeight}px`,
                    ...style,
                }}
                onChange={handleChange}
                {...props}
            />
        );
    }
);

TextArea.displayName = 'TextArea';
