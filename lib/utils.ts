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

// <table>...</table> 내부의 <p> 태그를 모두 언랩
function unwrapPInTable(html: string): string {
  return html.replace(
    /(<table[\s\S]*?>)([\s\S]*?)(<\/table>)/gi,
    (match, open, content, close) => {
      // 테이블 내부의 <p> 태그 제거
      const cleaned = content.replace(/<p>([\s\S]*?)<\/p>/gi, '$1');
      return open + cleaned + close;
    }
  );
}

// <p><tr>...</tr></p> 등 테이블 태그를 먼저 언랩
function unwrapPTableTags(html: string): string {
  // <p><tr>...</tr></p> → <tr>...</tr>
  html = html.replace(/<p>\s*(<(tr|thead|tbody|tfoot)[\s\S]*?<\/\2>)\s*<\/p>/gi, '$1');
  // <p><th>...</th></p> → <th>...</th>
  html = html.replace(/<p>\s*(<(th|td)[\s\S]*?<\/\2>)\s*<\/p>/gi, '$1');
  return html;
}

// <p><hN>...</hN></p> 등 블록 태그와 리스트 구조 언랩
function unwrapPBlockTags(html: string): string {
  // 1. 중첩된 <p> 태그 언랩: <p><p>...</p></p> → <p>...</p>
  while (/<p>\s*<p>([\s\S]*?)<\/p>\s*<\/p>/gi.test(html)) {
    html = html.replace(/<p>\s*<p>([\s\S]*?)<\/p>\s*<\/p>/gi, '<p>$1</p>');
  }
  // 2. 제목 태그와 블록 요소 언랩: <p><hN>...</hN></p> → <hN>...</hN>
  html = html.replace(/<p>\s*(<(h[1-6]|div|ul|ol|blockquote|pre|table)[\s\S]*?<\/\2>)\s*<\/p>/gi, '$1');
  // 3. 순서 없는 목록 내부 <p> 태그 언랩: <ul><p><li>...</li></p></ul> → <ul><li>...</li></ul>
  html = html.replace(/<ul>(\s*<p>(\s*<li[\s\S]*?<\/li>)\s*)<\/p>\s*<\/ul>/gi, '<ul>$2</ul>');
  // 4. 순서 있는 목록 내부 <p> 태그 언랩: <ol><p><li>...</li></p></ol> → <ol><li>...</li></ol>
  html = html.replace(/<ol>(\s*<p>(\s*<li[\s\S]*?<\/li>)\s*)<\/p>\s*<\/ol>/gi, '<ol>$2</ol>');
  // 5. 목록 항목 언랩: <p><li>...</li></p> → <li>...</li>
  html = html.replace(/<p>\s*(<li[\s\S]*?<\/li>)\s*<\/p>/gi, '$1');
  // 6. 목록 블록 언랩: <p><ul>...</ul></p> → <ul>...</ul>
  html = html.replace(/<p>\s*(<(ul|ol)[\s\S]*?<\/\2>)\s*<\/p>/gi, '$1');
  // 7. 코드 블록 언랩: <p><pre>...</pre></p> → <pre>...</pre>
  html = html.replace(/<p>\s*(<pre[\s\S]*?<\/pre>)\s*<\/p>/gi, '$1');
  // 8. div 블록 언랩: <p><div>...</div></p> → <div>...</div>
  html = html.replace(/<p>\s*(<div[\s\S]*?<\/div>)\s*<\/p>/gi, '$1');
  // 9. 테이블 블록 언랩: <p><table>...</table></p> → <table>...</table>
  html = html.replace(/<p>\s*(<table[\s\S]*?<\/table>)\s*<\/p>/gi, '$1');
  return html;
}

export function cleanHtml(html: string): string {
  // 0. sanitize-html 전에 <p>로 감싸진 테이블/블록 태그 언랩
  let preUnwrap = unwrapPTableTags(html);
  preUnwrap = unwrapPBlockTags(preUnwrap);
  console.log('[cleanHtml] after unwrapPTableTags+BlockTags:', preUnwrap);

  // 1. 엔티티 복원
  const decoded = decodeHtmlEntities(preUnwrap);
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

  // 2.5. 테이블 내부의 <p> 태그 언랩
  safe = unwrapPInTable(safe);
  console.log('[cleanHtml] after unwrapPInTable:', safe);

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
    // <p> 태그가 블록/테이블 태그 하나만 자식으로 가질 때 언랩
    if (elem.name === 'p' && elem.children.length === 1) {
      const child = elem.children[0]
      if (
        child.type === 'tag' &&
        [
          // 테이블 관련 태그
          'li', 'tr', 'th', 'td', 'thead', 'tbody', 'tfoot',
          // 제목 태그
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          // 블록 요소
          'div', 'ul', 'ol', 'blockquote', 'pre', 'table'
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
