/**
 * FormattedMessage Component
 * Renders AI assistant messages with proper formatting for lists, bold text, and spacing
 */
"use client";

import React from 'react';

interface FormattedMessageProps {
  content: string;
}

export function FormattedMessage({ content }: FormattedMessageProps) {
  // Split content into lines and process them
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: 'numbered' | 'bullet' | null = null;

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'numbered') {
        elements.push(
          <ol key={elements.length} className="list-decimal list-inside space-y-1.5 my-2 ml-2">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed">
                {formatInlineText(item)}
              </li>
            ))}
          </ol>
        );
      } else if (listType === 'bullet') {
        elements.push(
          <ul key={elements.length} className="list-disc list-inside space-y-1.5 my-2 ml-2">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed">
                {formatInlineText(item)}
              </li>
            ))}
          </ul>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  // Format inline text (bold, italic, code)
  const formatInlineText = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Match **bold**, `code`, and regular text
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matched = match[1];
      if (matched.startsWith('**') && matched.endsWith('**')) {
        // Bold text
        parts.push(
          <strong key={match.index} className="font-semibold text-foreground">
            {matched.slice(2, -2)}
          </strong>
        );
      } else if (matched.startsWith('`') && matched.endsWith('`')) {
        // Code text
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono"
          >
            {matched.slice(1, -1)}
          </code>
        );
      }

      lastIndex = match.index + matched.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Process each line
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Check for numbered list (1. 2. 3.)
    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      if (listType !== 'numbered') {
        flushList();
        listType = 'numbered';
      }
      currentList.push(numberedMatch[1]);
      return;
    }

    // Check for bullet list (- or *)
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (listType !== 'bullet') {
        flushList();
        listType = 'bullet';
      }
      currentList.push(bulletMatch[1]);
      return;
    }

    // Not a list item, flush any current list
    flushList();

    // Empty line - add spacing
    if (!trimmedLine) {
      elements.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={index} className="text-sm leading-relaxed my-1">
        {formatInlineText(trimmedLine)}
      </p>
    );
  });

  // Flush any remaining list
  flushList();

  return <div className="space-y-1">{elements}</div>;
}
