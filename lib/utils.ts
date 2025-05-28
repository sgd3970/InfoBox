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

export function cleanHtml(html: string): string {
  // 1) 엔티티 복원
  const decoded = decodeHtmlEntities(html);
  console.log('[cleanHtml] decoded:', decoded);

  // 2) sanitize-html로 정제
  const safe = sanitizeHtml(decoded, {
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
    parser: {
      lowerCaseTags: true,
      recognizeSelfClosing: true,
      decodeEntities: true // HTML 엔티티 디코딩 활성화
    }
  });
  console.log('[cleanHtml] after sanitizeHtml:', safe);

  // 3) 블록 요소만 감싸고 있는 <p> 태그 언랩
  const unwrapped = safe
    // <p><hN>…</hN></p> → <hN>…</hN>
    .replace(
      /<p>\s*(<(?:h[1-6]|div|table|ul|ol|blockquote|pre)[^>]+>[\s\S]*?<\/(?:h[1-6]|div|table|ul|ol|blockquote|pre)>)\s*<\/p>/g,
      '$1'
    )
    // <p><li>…</li></p> → <li>…</li>
    .replace(
      /<p>\s*(<li[^>]*>[\s\S]*?<\/li>)\s*<\/p>/g,
      '$1'
    )
    // <p><ul>…</ul></p> → <ul>…</ul>, 같은 패턴 for ol
    .replace(
      /<p>\s*(<(?:ul|ol)[^>]+>[\s\S]*?<\/(?:ul|ol)>)\s*<\/p>/g,
      '$1'
    );

  console.log('[cleanHtml] after unwrapping:', unwrapped);
  return unwrapped.trim();
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
