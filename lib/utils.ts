import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import sanitizeHtml from 'sanitize-html';
import { parseDocument } from 'htmlparser2';
import { Element } from 'domhandler';
import { render } from 'dom-serializer';

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

  // 2. sanitize-html로 1차 정제
  let safe = sanitizeHtml(decoded, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      '*': ['class','style'],
      a: ['href','target','rel'],
      img: ['src','alt','width','height'],
    },
    exclusiveFilter(frame: { tag: string; text: string }) {
      // <p> 내부가 공백, &nbsp;, <br>만 있으면 제거
      const text = (frame.text || '').replace(/&nbsp;|\s|<br\s*\/?>/gi, '');
      return frame.tag === 'p' && !text;
    }
  });

  // 3. sanitize-html로도 안 지워지는 <p><br></p> 등 후처리
  safe = safe.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');

  // 4. 블록요소만 단독으로 감싼 <p> 언랩
  safe = safe
    .replace(/<p>\s*(<(?:h[1-6]|div|table|ul|ol|blockquote|pre)[\s\S]+?>)\s*<\/p>/g, '$1')
    .replace(/(<\/(?:h[1-6]|div|table|ul|ol|blockquote|pre)>)\s*<\/p>/g, '$1');

  // 5. 테이블 관련 태그 정리
  safe = safe
    .replace(/<p>(\s*<(?:td|th)[^>]*>[\s\S]*?<\/(?:td|th)>)<\/p>/g, '$1')
    .replace(/<p>(\s*<(?:tr|thead|tbody|tfoot)[^>]*>[\s\S]*?<\/(?:tr|thead|tbody|tfoot)>)<\/p>/g, '$1');

  // 6. 연속된 줄바꿈 제거
  safe = safe.replace(/\n\s*\n/g, '\n');

  // 마지막에 잘못된 p 언랩
  return cleanBrokenP(safe)
}

export function cleanQuillHtml(html: string) {
  return html
    // 빈 p 제거
    .replace(/<p><br><\/p>/g, '')
    // 이미지 태그를 감싸는 p 제거
    .replace(/<p>(<img[^>]+>)<\/p>/g, '$1')
    // 여러 연속 p 태그 정리
    .replace(/(<\/p>\s*){2,}/g, '</p>')
    .trim()
}

// <p><li>...</li></p> → <li>...</li> 등 잘못된 p 언랩
export function cleanBrokenP(html: string): string {
  const dom = parseDocument(html)

  function unwrapInvalidP(elem: Element) {
    if (elem.name === 'p' && elem.children.length === 1) {
      const child = elem.children[0]
      if (
        child.type === 'tag' &&
        ['li', 'th', 'td'].includes(child.name)
      ) {
        Object.assign(elem, child) // unwrap
      }
    }
    if ('children' in elem && Array.isArray(elem.children)) {
      elem.children.forEach((c: any) => {
        if (c.type === 'tag') unwrapInvalidP(c)
      })
    }
  }

  dom.children.forEach((c: any) => {
    if (c.type === 'tag') unwrapInvalidP(c)
  })

  return render(dom)
}
