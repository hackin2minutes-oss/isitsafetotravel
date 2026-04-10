import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * AVIATION API — OpsGroup SafeAirspace Scraper
 * Source: https://safeairspace.net
 *
 * Page structure (important):
 *   //var IranWarning = 'FULL CONTENT TEXT...'  ← commented but has the real content
 *     var IranWarning = '';                      ← active JS var, always empty
 *
 * The JS runtime reads the //var lines as string values for map tooltips.
 * We must parse the //var lines (not the empty active var declarations).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || '';

  if (!country) {
    return NextResponse.json({ status: 'open', warning: null, source: 'OpsGroup SafeAirspace' });
  }

  try {
    const response = await fetch('https://safeairspace.net/', {
      next: { revalidate: 1800 }, // 30-min cache
    });
    if (!response.ok) throw new Error(`SafeAirspace HTTP ${response.status}`);
    const html = await response.text();

    // ── Extract //var [Name]Warning = '...' lines (the ones with real content) ──
    const allWarnings: Record<string, string> = {};

    // Match commented-out var lines: //var XxxWarning = 'content';
    // Content can span multiple lines — lazy match up to the first '; that closes it
    const pattern = /\/\/var\s+([A-Za-z]+)Warning\s*=\s*'([\s\S]*?)';/g;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(html)) !== null) {
      const name = m[1].toLowerCase();
      const content = m[2].trim();
      // Only store if content is non-empty (skip empty declarations)
      if (content.length > 20) {
        allWarnings[name] = content;
      }
    }

    // ── Normalise country name → SafeAirspace key ──────────────────────────
    const normalised = country.toLowerCase().replace(/[\s\-_']+/g, '');

    const ALIAS: Record<string, string> = {
      uk: 'unitedkingdom',
      gb: 'unitedkingdom',
      usa: 'unitedstates',
      us: 'unitedstates',
      uae: 'unitedarabemirates',
      drc: 'congodrc',
      democraticrepublicofthecongo: 'congodrc',
      myanmar: 'myanmar',
      burma: 'myanmar',
      southkorea: 'southkorea',
      republicofkorea: 'southkorea',
      northkorea: 'northkorea',
      dprk: 'northkorea',
      ksa: 'saudiarabia',
      centralamerica: 'centralamerica',
    };

    const key = ALIAS[normalised] || normalised;

    // Exact match first, then partial
    let warnText = allWarnings[key] || null;
    if (!warnText) {
      const partialKey = Object.keys(allWarnings).find(
        k => k.includes(key) || key.includes(k)
      );
      if (partialKey) warnText = allWarnings[partialKey];
    }

    if (!warnText) {
      // Country not listed on SafeAirspace = no known restriction
      return NextResponse.json({
        status: 'open',
        warning: null,
        source: 'OpsGroup SafeAirspace',
        sourceUrl: 'https://safeairspace.net',
        lastUpdated: new Date().toISOString(),
      });
    }

    // ── Strip HTML tags → plain text ───────────────────────────────────────
    const plain = warnText
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // ── Derive status from keywords ────────────────────────────────────────
    // We prioritize the FIRST 150 characters for the ACTUAL status.
    // SafeAirspace often lists historical or regional context later in the text.
    const statusText = plain.slice(0, 150).toLowerCase();
    const fullText = plain.toLowerCase();
    
    let status: 'open' | 'restricted' | 'closed' = 'open';

    // 1. Check for explicit AIRSPACE CLOSED (very high priority)
    // Flexible regex allowing for (FIR codes) or other text between airspace/FIR and closed
    const isClosed = /(airspace|fir).*?(is\s+)?(currently\s+)?closed/.test(fullText);
    const remainsOpen = /(airspace|fir|operations).*?(remains?\s+open|remain\s+normal)/.test(statusText);

    if (remainsOpen) {
      status = 'open';
    } else if (isClosed) {
      status = 'closed';
    } 
    // 2. Check for AVOID or NO FLY in the immediate headline
    else if (/\bavoid\b|\bnot\s+(fly|enter|operate)\b|\bprohibited\b/.test(statusText)) {
      status = 'restricted';
    }
    // 3. Match explicit status keywords only if they appear early or are very strong
    else if (/\bclosed\b/.test(statusText) || /\brestricted\b/.test(statusText)) {
      status = 'restricted';
    }
    // 4. Default to 'open' even if words like 'caution' or 'advisory' appear later
    // unless they are in the VERY beginning of the text
    else if (/^(caution|advisory|warning)/i.test(plain.slice(0, 25))) {
      status = 'restricted';
    }

    const headline = plain.split('.')[0].trim().slice(0, 220);

    return NextResponse.json({
      status,
      headline,
      warning: plain.slice(0, 1200),
      source: 'OpsGroup SafeAirspace',
      sourceUrl: 'https://safeairspace.net',
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('SAFEAIRSPACE_ERROR:', error);
    return NextResponse.json({
      status: 'open',
      warning: null,
      source: 'OpsGroup SafeAirspace',
      error: 'SafeAirspace temporarily unreachable',
    });
  }
}
