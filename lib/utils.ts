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
    return String.fromCharCode(parseInt(hex, 16));
  });

  // Third pass: Handle decimal entities
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
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

// <p><hN>...</hN></p> 등 블록 태그와 리스트 구조 언랩 (더 강하게 반복 적용)
function unwrapPBlockTags(html: string): string {
  let prev;
  do {
    prev = html;
    // 1. 중첩된 <p> 태그 언랩: <p><p>...</p></p> → <p>...</p>
    html = html.replace(/<p>\s*<p>([\s\S]*?)<\/p>\s*<\/p>/gi, '<p>$1</p>');
    
    // 2. 제목 태그와 블록 요소 언랩: <p><hN>...</hN></p> → <hN>...</hN>
    html = html.replace(/<p>\s*(<(h[1-6]|div|ul|ol|li|blockquote|pre|table)[\s\S]*?<\/\2>)\s*<\/p>/gi, '$1');
    
    // 3. <p>로 감싼 ul/ol/li 반복 언랩
    html = html.replace(/<p>\s*(<(ul|ol|li)[\s\S]*?<\/\2>)\s*<\/p>/gi, '$1');
    
    // 4. <ul><p><li>...</li></p></ul> → <ul><li>...</li></ul>
    html = html.replace(/<ul>(\s*<p>(\s*<li[\s\S]*?<\/li>)\s*)<\/p>\s*<\/ul>/gi, '<ul>$2</ul>');
    
    // 5. <ol><p><li>...</li></p></ol> → <ol><li>...</li></ol>
    html = html.replace(/<ol>(\s*<p>(\s*<li[\s\S]*?<\/li>)\s*)<\/p>\s*<\/ol>/gi, '<ol>$2</ol>');
    
    // 6. <p><li>...</li></p> → <li>...</li>
    html = html.replace(/<p>\s*(<li[\s\S]*?<\/li>)\s*<\/p>/gi, '$1');
    
    // 7. <p><ul>...</ul></p> → <ul>...</ul>
    html = html.replace(/<p>\s*(<(ul|ol)[\s\S]*?<\/\2>)\s*<\/p>/gi, '$1');

    // 8. <p><h3>...</h3></p> → <h3>...</h3>
    html = html.replace(/<p>\s*(<h3[\s\S]*?<\/h3>)\s*<\/p>/gi, '$1');
    
    // 9. <p><h4>...</h4></p> → <h4>...</h4>
    html = html.replace(/<p>\s*(<h4[\s\S]*?<\/h4>)\s*<\/p>/gi, '$1');

    // 10. <p> 내부에 여러 블록 태그가 있을 때도 언랩
    html = html.replace(/<p>(\s*(<(h[1-6]|div|ul|ol|li|blockquote|pre|table)[^>]*>[\s\S]*?<\/\3>\s*)+)<\/p>/gi, '$1');

    // 11. <p> 내부에 단일 블록 태그가 있을 때 언랩
    html = html.replace(/<p>\s*(<(h[1-6]|div|ul|ol|li|blockquote|pre|table)[^>]*>[\s\S]*?<\/\2>)\s*<\/p>/gi, '$1');
  } while (html !== prev);
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
    },
    // 특수문자와 이모지 보존을 위한 설정
    textFilter: (text: string) => text,
    parser: {
      lowerCaseTags: true,
      recognizeSelfClosing: true,
      decodeEntities: false // HTML 엔티티 디코딩 비활성화 (이미 위에서 처리했으므로)
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

  const result = render(dom)
  console.log('[cleanBrokenP] dom after:', result);
  return result
}
