import React from 'react';
import type { GroundingChunk } from '../types';
import CollapsibleSection from './CollapsibleSection';

interface AnalysisResultProps {
  analysis: string;
  sources: GroundingChunk[] | null;
}

// Helper function to parse a line for markdown links, bold, and italic text
const parseInlineMarkdown = (line: string, keyPrefix: string | number): React.ReactNode => {
    // Regex to find link, then bold, then italic. Order is important.
    const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    
    // Quick check to avoid regex on simple strings
    if (!line.includes('](') && !line.includes('**') && !line.includes('*')) {
        return line;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let partIndex = 0;

    // Must reset lastIndex before exec loop if regex is global
    markdownRegex.lastIndex = 0;

    while ((match = markdownRegex.exec(line)) !== null) {
        // Add the text before the match
        if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index));
        }

        const [_fullMatch, linkText, url, boldText, italicText] = match;

        if (linkText && url) { // It's a link
            parts.push(
                <a 
                    href={url} 
                    key={`${keyPrefix}-link-${partIndex}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                    {linkText}
                </a>
            );
        } else if (boldText) { // It's bold text
            parts.push(
                <strong key={`${keyPrefix}-bold-${partIndex}`}>
                    {boldText}
                </strong>
            );
        } else if (italicText) { // It's italic text
            parts.push(
                <em key={`${keyPrefix}-italic-${partIndex}`} className="italic">
                    {italicText}
                </em>
            );
        }
        
        lastIndex = markdownRegex.lastIndex;
        partIndex++;
    }

    // Add any remaining text after the last match
    if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
    }

    return parts.length > 1 ? <>{parts}</> : (parts[0] || '');
};

const parseSectionContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const elements = lines.map((line, index) => {
        const trimmedLine = line.trim();
        // Heading 4
        if (trimmedLine.startsWith('#### ')) {
            return <h4 key={index} className="text-lg font-semibold mt-4 mb-2 text-brand-green">{parseInlineMarkdown(trimmedLine.substring(5), index)}</h4>;
        }
        // Heading 3
        if (trimmedLine.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-brand-green">{parseInlineMarkdown(trimmedLine.substring(4), index)}</h3>;
        }
        // Unordered list items (e.g., * Item)
        if (trimmedLine.startsWith('* ')) {
            return <li key={index} className="ml-5 list-disc">{parseInlineMarkdown(trimmedLine.substring(2), index)}</li>;
        }
        // Numbered list items (e.g., 1. Item)
        const numberedListMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
        if (numberedListMatch) {
             return <li key={index} className="ml-5 list-decimal">{parseInlineMarkdown(numberedListMatch[2], index)}</li>;
        }
        // Paragraph
        return <p key={index} className="mb-2">{parseInlineMarkdown(line, index)}</p>;
    }).filter((el): el is React.ReactElement => el !== null);

    const groupedElements: React.ReactElement[] = [];
    let listItems: React.ReactElement[] = [];
    let currentListType: 'ul' | 'ol' | null = null;

    elements.forEach((el, index) => {
        const isListItem = el.type === 'li';
        // Fix: Safely access className prop with a type assertion to prevent "property does not exist on type 'unknown'" error.
        const className = (el.props as { className?: string }).className;
        const listType = isListItem && typeof className === 'string' ? (className.includes('list-disc') ? 'ul' : 'ol') : null;

        if (isListItem && (!currentListType || currentListType === listType)) {
            // Continue current list or start a new one of the same type
            listItems.push(el);
            currentListType = listType;
        } else {
            // End of a list or switch in list type
            if (listItems.length > 0 && currentListType) {
                 const ListComponent = currentListType;
                 groupedElements.push(<ListComponent key={`list-${index-1}`} className="mb-4 list-inside">{listItems}</ListComponent>);
                 listItems = [];
                 currentListType = null;
            }
            // If the current element is a new list item of a different type
            if (isListItem) {
                 listItems.push(el);
                 currentListType = listType;
            } else {
                 // It's not a list item, just push it
                 groupedElements.push(el);
            }
        }
    });

    if (listItems.length > 0 && currentListType) {
         const ListComponent = currentListType;
         groupedElements.push(<ListComponent key="list-last" className="mb-4 list-inside">{listItems}</ListComponent>);
    }

    return groupedElements;
};

const parseMarkdownIntoSections = (text: string) => {
    const sections = text.split(/\n(?=## )/).map(s => s.trim()).filter(Boolean);
    
    return sections.map(sectionText => {
        const lines = sectionText.split('\n');
        const title = lines[0].replace('## ', '').trim();
        const content = lines.slice(1).join('\n').trim();
        return {
            title,
            content: parseSectionContent(content)
        };
    });
};


const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, sources }) => {
  const sections = parseMarkdownIntoSections(analysis);

  return (
    <div className="mt-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-brand-green mb-6">
        Hasil Analisis
      </h2>
      <div className="prose max-w-none border-t border-gray-200">
         {sections.map((section, index) => (
             <CollapsibleSection 
                key={index} 
                title={section.title}
                defaultOpen={index === 0} // Open the first section by default
             >
                 {section.content}
             </CollapsibleSection>
         ))}
      </div>

      {sources && sources.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-brand-green mb-3">Sumber dari Web</h3>
          <ul className="space-y-2">
            {sources.map((source, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-4 h-4 text-brand-light-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"></path></svg>
                <a
                  href={source.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline truncate"
                  title={source.web.title}
                >
                  {source.web.title || source.web.uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;
