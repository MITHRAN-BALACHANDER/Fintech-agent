/**
 * Message Formatter Component
 * Handles markdown-style formatting in chat messages
 */

import { memo } from "react";

interface MessageFormatterProps {
  content: string;
}

/**
 * Formats chat messages with support for:
 * - **bold text**
 * - Line breaks
 * - Bullet points (*)
 * - Numbered lists (numbers followed by .)
 */
const MessageFormatter = memo(({ content }: MessageFormatterProps) => {
  const formatLine = (line: string, index: number) => {
    // Handle empty lines
    if (!line.trim()) {
      return <br key={index} />;
    }

    // Handle bullet points
    if (line.trim().startsWith('* ') || line.trim().startsWith('• ')) {
      const bulletContent = line.replace(/^[\s]*[*•][\s]*/, '');
      return (
        <li key={index} className="ml-4 mb-1">
          {formatInlineText(bulletContent)}
        </li>
      );
    }

    // Handle numbered lists (e.g., "1. ", "2. ")
    const numberedMatch = line.match(/^[\s]*(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      return (
        <li key={index} className="ml-4 mb-1" value={parseInt(numberedMatch[1])}>
          {formatInlineText(numberedMatch[2])}
        </li>
      );
    }

    // Regular paragraph
    return (
      <p key={index} className="mb-2 last:mb-0">
        {formatInlineText(line)}
      </p>
    );
  };

  const formatInlineText = (text: string) => {
    // Split by ** for bold formatting
    const parts = text.split('**');
    
    return parts.map((part, i) => {
      // Odd indices are bold
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold">{part}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Split content into lines
  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  let bulletListItems: React.ReactElement[] = [];
  let numberedListItems: React.ReactElement[] = [];

  lines.forEach((line, index) => {
    const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('• ');
    const isNumbered = /^[\s]*\d+\.\s+/.test(line);

    if (isBullet) {
      // Close any open numbered list
      if (numberedListItems.length > 0) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal mb-2">
            {numberedListItems}
          </ol>
        );
        numberedListItems = [];
      }
      bulletListItems.push(formatLine(line, index));
    } else if (isNumbered) {
      // Close any open bullet list
      if (bulletListItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc mb-2">
            {bulletListItems}
          </ul>
        );
        bulletListItems = [];
      }
      numberedListItems.push(formatLine(line, index));
    } else {
      // Close any open lists
      if (bulletListItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc mb-2">
            {bulletListItems}
          </ul>
        );
        bulletListItems = [];
      }
      if (numberedListItems.length > 0) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal mb-2">
            {numberedListItems}
          </ol>
        );
        numberedListItems = [];
      }
      elements.push(formatLine(line, index));
    }
  });

  // Close any remaining open lists
  if (bulletListItems.length > 0) {
    elements.push(
      <ul key={`ul-${elements.length}`} className="list-disc mb-2">
        {bulletListItems}
      </ul>
    );
  }
  if (numberedListItems.length > 0) {
    elements.push(
      <ol key={`ol-${elements.length}`} className="list-decimal mb-2">
        {numberedListItems}
      </ol>
    );
  }

  return <div className="text-sm leading-relaxed">{elements}</div>;
});

MessageFormatter.displayName = "MessageFormatter";

export default MessageFormatter;
