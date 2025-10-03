import React from 'react';
import { sanitizeForDisplay } from '../lib/sanitization';

interface SanitizedContentProps {
  content: string;
  className?: string;
}

/**
 * Component that safely renders user content with sanitization
 */
export const SanitizedContent: React.FC<SanitizedContentProps> = ({ 
  content, 
  className 
}) => {
  const sanitizedContent = sanitizeForDisplay(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

/**
 * Component that renders plain text content (no HTML)
 */
export const PlainTextContent: React.FC<SanitizedContentProps> = ({ 
  content, 
  className 
}) => {
  // Remove all HTML tags for plain text display
  const plainText = content.replace(/<[^>]*>/g, '');
  
  return (
    <div className={className}>
      {plainText}
    </div>
  );
};
