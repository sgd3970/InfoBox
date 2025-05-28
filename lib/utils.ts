import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import sanitizeHtml from 'sanitize-html';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ALLOWED_TAGS = [
  'h1','h2','h3','h4','h5','h6',
  'p','br','hr','ul','ol','li','strong','em','u','s','code',
  'a','img','blockquote','pre',
  'table','thead','tbody','tr','th','td',
  'div','span'
];

function decodeHtmlEntities(html: string) {
  return html.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function cleanHtml(html: string): string {
  // 1. 엔티티 복원
  const decoded = decodeHtmlEntities(html);

  // 2. 기본 sanitize
  const safe = sanitizeHtml(decoded, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      '*': ['class','style'],
      a: ['href','target','rel'],
      img: ['src','alt','width','height'],
    },
    exclusiveFilter(frame: { tag: string; text: string }) {
      // 빈 p 태그는 제거
      return frame.tag === 'p' && !frame.text.trim();
    }
  });

  return safe.trim();
}
