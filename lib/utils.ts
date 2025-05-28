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

function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  
  // First pass: Handle basic HTML entities
  let decoded = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/&euro;/g, '€')
    .replace(/&pound;/g, '£')
    .replace(/&yen;/g, '¥')
    .replace(/&cent;/g, '¢')
    .replace(/&sect;/g, '§')
    .replace(/&deg;/g, '°')
    .replace(/&plusmn;/g, '±')
    .replace(/&times;/g, '×')
    .replace(/&divide;/g, '÷')
    .replace(/&micro;/g, 'µ')
    .replace(/&para;/g, '¶')
    .replace(/&middot;/g, '·')
    .replace(/&bull;/g, '•')
    .replace(/&dagger;/g, '†')
    .replace(/&Dagger;/g, '‡')
    .replace(/&larr;/g, '←')
    .replace(/&uarr;/g, '↑')
    .replace(/&rarr;/g, '→')
    .replace(/&darr;/g, '↓')
    .replace(/&harr;/g, '↔')
    .replace(/&crarr;/g, '↵')
    .replace(/&lceil;/g, '⌈')
    .replace(/&rceil;/g, '⌉')
    .replace(/&lfloor;/g, '⌊')
    .replace(/&rfloor;/g, '⌋')
    .replace(/&loz;/g, '◊')
    .replace(/&spades;/g, '♠')
    .replace(/&clubs;/g, '♣')
    .replace(/&hearts;/g, '♥')
    .replace(/&diams;/g, '♦');

  // Second pass: Handle hex entities
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    return String.fromCodePoint(parseInt(hex, 16));
  });

  // Third pass: Handle decimal entities
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) => {
    return String.fromCodePoint(parseInt(dec, 10));
  });

  // Fourth pass: Handle named entities
  const entities: { [key: string]: string } = {
    '&Aacute;': 'Á', '&aacute;': 'á',
    '&Acirc;': 'Â', '&acirc;': 'â',
    '&AElig;': 'Æ', '&aelig;': 'æ',
    '&Agrave;': 'À', '&agrave;': 'à',
    '&Aring;': 'Å', '&aring;': 'å',
    '&Atilde;': 'Ã', '&atilde;': 'ã',
    '&Auml;': 'Ä', '&auml;': 'ä',
    '&Ccedil;': 'Ç', '&ccedil;': 'ç',
    '&Eacute;': 'É', '&eacute;': 'é',
    '&Ecirc;': 'Ê', '&ecirc;': 'ê',
    '&Egrave;': 'È', '&egrave;': 'è',
    '&ETH;': 'Ð', '&eth;': 'ð',
    '&Euml;': 'Ë', '&euml;': 'ë',
    '&Iacute;': 'Í', '&iacute;': 'í',
    '&Icirc;': 'Î', '&icirc;': 'î',
    '&Igrave;': 'Ì', '&igrave;': 'ì',
    '&Iuml;': 'Ï', '&iuml;': 'ï',
    '&Ntilde;': 'Ñ', '&ntilde;': 'ñ',
    '&Oacute;': 'Ó', '&oacute;': 'ó',
    '&Ocirc;': 'Ô', '&ocirc;': 'ô',
    '&Ograve;': 'Ò', '&ograve;': 'ò',
    '&Oslash;': 'Ø', '&oslash;': 'ø',
    '&Otilde;': 'Õ', '&otilde;': 'õ',
    '&Ouml;': 'Ö', '&ouml;': 'ö',
    '&THORN;': 'Þ', '&thorn;': 'þ',
    '&Uacute;': 'Ú', '&uacute;': 'ú',
    '&Ucirc;': 'Û', '&ucirc;': 'û',
    '&Ugrave;': 'Ù', '&ugrave;': 'ù',
    '&Uuml;': 'Ü', '&uuml;': 'ü',
    '&Yacute;': 'Ý', '&yacute;': 'ý',
    '&Yuml;': 'Ÿ', '&yuml;': 'ÿ',
    '&szlig;': 'ß'
  };

  Object.entries(entities).forEach(([entity, char]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  });

  return decoded;
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
  let prev;
  do {
    prev = html;
    
    // (A) 중첩된 <p> 풀기
    html = html.replace(/<p>\s*<p>([\s\S]*?)<\/p>\s*<\/p>/gi, '<p>$1</p>');
    
    // (B) 모든 주요 블록 태그 언랩
    html = html.replace(
      /<p>\s*(<(?:h[1-6]|div|section|article|header|footer|nav|ul|ol|li|blockquote|pre|table)[\s\S]*?<\/(?:h[1-6]|div|section|article|header|footer|nav|ul|ol|li|blockquote|pre|table)>)\s*<\/p>/gi,
      '$1'
    );
    
    // (C) 리스트 안의 불필요한 p 제거
    html = html.replace(/<p>\s*(<li[\s\S]*?<\/li>)\s*<\/p>/gi, '$1');
    html = html.replace(/<p>\s*(<(?:ul|ol)[\s\S]*?<\/(?:ul|ol)>)\s*<\/p>/gi, '$1');
  } while (html !== prev);
  return html;
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

export function cleanHtml(input: string): string {
  let html = input;

  // 0a) 블록 레벨 열림 태그(<div>, <table> 등) 직전의 잘못된 </p> 제거
  html = html.replace(
    /<\/p>\s*(<(?:div|table|thead|tbody|tfoot|tr|th|td|ul|ol|li|blockquote|pre)[^>]*>)/gi,
    '$1'
  );
  // 0b) 블록 레벨 닫힘 태그(</div>, </table> 등) 직후의 잘못된 <p> 제거
  html = html.replace(
    /(<\/(?:div|table|thead|tbody|tfoot|tr|th|td|ul|ol|li|blockquote|pre)>)[ \t\r\n]*<p>/gi,
    '$1'
  );
  // 0c) 블록 레벨 열림 태그(<div>, <table> 등) 직후의 잘못된 </p> 제거
  html = html.replace(
    /(<(?:div|table|thead|tbody|tfoot|tr|th|td|ul|ol|li|blockquote|pre)[^>]*>)[ \t\r\n]*<\/p>/gi,
    '$1'
  );
  // 0d) 블록 레벨 닫힘 태그(</div>, </table> 등) 직전의 잘못된 <p> 제거
  html = html.replace(
    /<p>[ \t\r\n]*(<\/(?:div|table|thead|tbody|tfoot|tr|th|td|ul|ol|li|blockquote|pre)>)/gi,
    '$1'
  );
  console.log('[cleanHtml] after removing incorrect p tags:', html);

  // 0) 테이블/블록 태그 앞뒤 <p> 해제 (pre)
  html = unwrapPTableTags(html);
  html = unwrapPBlockTags(html);
  console.log('[cleanHtml] after pre-unwrapping:', html);

  // 1) 엔티티 복원
  html = decodeHtmlEntities(html);
  console.log('[cleanHtml] decoded:', html);

  // 2) sanitize-html
  html = sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      '*': ['class','style'],
      a: ['href','target','rel'],
      img: ['src','alt','width','height'],
    },
    exclusiveFilter: (frame: { tag: string; text: string }) => frame.tag === 'p' && !frame.text.trim(),
    parser: {
      lowerCaseTags: true,
      recognizeSelfClosing: true,
      decodeEntities: true
    }
  });
  console.log('[cleanHtml] after sanitizeHtml:', html);

  // 3) sanitize 이후에도 블록 태그 감싸기 풀기 (post)
  html = unwrapPBlockTags(html);
  console.log('[cleanHtml] after post-unwrapping:', html);

  // 4) <table> 내부 <p> 언랩
  html = unwrapPInTable(html);
  console.log('[cleanHtml] after unwrapPInTable:', html);

  // 5) DOM 레벨에서 남은 잘못된 <p> 전부 언랩
  html = cleanBrokenP(html);
  console.log('[cleanHtml] after cleanBrokenP:', html);

  // 6) numeric entity가 남아있다면 모두 실제 문자로 복원
  html = decodeHtmlEntities(html);
  console.log('[cleanHtml] final decode:', html);

  return html.trim();
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
  // parseDocument에선 그대로 numeric entity 유지
  const dom = parseDocument(html, {
    lowerCaseTags: true,
    recognizeSelfClosing: true,
    decodeEntities: false,  // numeric entity를 풀지 않도록
  });
  console.log('[cleanBrokenP] dom before:', render(dom));

  // 블록 태그 목록
  const blockTags = [
    'li', 'tr', 'th', 'td', 'thead', 'tbody', 'tfoot',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'div', 'ul', 'ol', 'blockquote', 'pre', 'table'
  ];

  function unwrapInvalidP(elem: Element) {
    // <p>가 블록 태그만 자식으로 여러 개를 가질 때도 언랩
    if (elem.name === 'p') {
      const children = elem.children.filter((c: any) => c.type === 'tag');
      if (
        children.length > 0 &&
        children.every((c: any) => blockTags.includes(c.name))
      ) {
        // 부모의 자식 배열에서 p를 children로 교체
        if (elem.parent && 'children' in elem.parent) {
          const parent = elem.parent as Element;
          const index = parent.children.indexOf(elem);
          if (index !== -1) {
            // children를 parent에 삽입
            parent.children.splice(index, 1, ...children);
            children.forEach((c: any) => (c.parent = parent));
            // 각 children도 재귀적으로 검사
            children.forEach((c: any) => unwrapInvalidP(c));
            return;
          }
        }
      }
    }
    // 기존: <p> 태그가 블록/테이블 태그 하나만 자식으로 가질 때 반복 언랩
    while (
      elem.name === 'p' &&
      elem.children.length === 1 &&
      elem.children[0].type === 'tag' &&
      blockTags.includes(elem.children[0].name)
    ) {
      const child = elem.children[0] as Element;
      if (elem.parent && 'children' in elem.parent) {
        const parent = elem.parent as Element;
        const index = parent.children.indexOf(elem);
        if (index !== -1) {
          parent.children[index] = child;
          child.parent = parent;
          elem = child; // 언랩된 자식으로 반복
        } else {
          break;
        }
      } else {
        break;
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

  // render 할 때 numeric entity → 문자로 디코딩
  const result = render(dom, { decodeEntities: true });
  console.log('[cleanBrokenP] dom after:', result);
  return result;
}
