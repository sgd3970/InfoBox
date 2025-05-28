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
  console.log('[cleanHtml] decoded:', decoded);

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
      const text = (frame.text || '').replace(/&nbsp;|\s|<br\s*\/?\>/gi, '');
      return frame.tag === 'p' && !text;
    }
  });
  console.log('[cleanHtml] after sanitizeHtml:', safe);

  // 3. sanitize-html로도 안 지워지는 <p><br></p> 등 후처리
  safe = safe.replace(/<p>(\s|&nbsp;|<br\s*\/?\>)*<\/p>/gi, '');

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
  const cleaned = cleanBrokenP(safe);
  console.log('[cleanHtml] after cleanBrokenP:', cleaned);
  return cleaned;
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
  console.log('[cleanBrokenP] dom before:', render(dom));

  function unwrapInvalidP(elem: Element) {
    // <p>가 블록/테이블 태그 하나만 자식으로 가질 때 언랩
    if (elem.name === 'p' && elem.children.length === 1) {
      const child = elem.children[0]
      if (
        child.type === 'tag' &&
        [
          'li', 'tr', 'th', 'td', 'thead', 'tbody', 'tfoot',
          // 필요시 블록 태그 추가
        ].includes(child.name)
      ) {
        // 부모 요소의 자식 배열에서 p를 찾아서 child로 교체
        if (elem.parent && 'children' in elem.parent) {
          const parent = elem.parent as Element
          const index = parent.children.indexOf(elem)
          if (index !== -1) {
            parent.children[index] = child
            child.parent = parent
            // 언랩된 자식도 재귀적으로 검사
            if (child.type === 'tag') unwrapInvalidP(child)
            return // 교체 후 더 진행하지 않음
          }
        }
      }
    }
    // 자식이 있으면 재귀적으로 검사
    if ('children' in elem && Array.isArray(elem.children)) {
      elem.children.forEach((c: any) => {
        if (c.type === 'tag') unwrapInvalidP(c)
      })
    }
  }

  dom.children.forEach((c: any) => {
    if (c.type === 'tag') unwrapInvalidP(c)
  })

  const result = render(dom)
  console.log('[cleanBrokenP] dom after:', result);
  return result
}
