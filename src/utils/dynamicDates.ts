/**
 * Dynamic Date & Market Time Engine for IndianShares Platform
 * Ensures all corporate filings, IPOs, dividends, and market timestamps
 * are dynamically anchored to the current live calendar date, providing
 * authentic real-time market presence.
 */

import { MarketIndex, StockQuote, IpoItem, DividendItem, NewsItem, CorporateAction } from '../types/index.ts';

export interface MarketSessionStatus {
  isOpen: boolean;
  isPreMarket: boolean;
  statusLabel: string;
  statusBadge: string;
  timeStringIst: string;
  dateStringIst: string;
  timeUntilOpenOrClose: string;
}

/**
 * Returns Indian Standard Time (IST, UTC+5:30) date object and market session info
 */
export function getIndianMarketStatus(): MarketSessionStatus {
  const now = new Date();
  
  // Calculate IST (UTC + 5 hours 30 mins)
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istMs = utcMs + (5.5 * 3600000);
  const istDate = new Date(istMs);

  const dayOfWeek = istDate.getUTCDay(); // 0 is Sun, 6 is Sat
  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const seconds = istDate.getUTCSeconds();
  const timeInMinutes = hours * 60 + minutes;

  // Indian Stock Market Hours:
  // Normal Market: Monday (1) to Friday (5), 09:15 to 15:30 IST (555 to 930 mins)
  // Pre-Market: 09:00 to 09:15 IST (540 to 555 mins)
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isPreMarket = isWeekday && timeInMinutes >= 540 && timeInMinutes < 555;
  const isOpen = isWeekday && timeInMinutes >= 555 && timeInMinutes < 930;

  let statusLabel = 'MARKET CLOSED';
  let statusBadge = 'bg-slate-800 text-slate-400 border-slate-700';
  let timeUntilOpenOrClose = 'Market closed';

  if (isOpen) {
    statusLabel = 'NSE/BSE LIVE';
    statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    const remainingMins = 930 - timeInMinutes;
    const remH = Math.floor(remainingMins / 60);
    const remM = remainingMins % 60;
    timeUntilOpenOrClose = `Closes in ${remH > 0 ? `${remH}h ` : ''}${remM}m`;
  } else if (isPreMarket) {
    statusLabel = 'PRE-MARKET OPEN';
    statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    const remainingMins = 555 - timeInMinutes;
    timeUntilOpenOrClose = `Normal session opens in ${remainingMins}m`;
  } else {
    statusLabel = 'MARKET CLOSED';
    statusBadge = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
    if (isWeekday && timeInMinutes < 540) {
      const untilOpen = 555 - timeInMinutes;
      const h = Math.floor(untilOpen / 60);
      const m = untilOpen % 60;
      timeUntilOpenOrClose = `Opens today in ${h}h ${m}m (09:15 IST)`;
    } else if (dayOfWeek === 5 && timeInMinutes >= 930) {
      timeUntilOpenOrClose = 'Opens Monday 09:15 IST';
    } else if (dayOfWeek === 6 || dayOfWeek === 0) {
      timeUntilOpenOrClose = 'Weekend • Opens Monday 09:15 IST';
    } else {
      timeUntilOpenOrClose = 'Opens next session 09:15 IST';
    }
  }

  // Format strings
  const pad = (n: number) => n.toString().padStart(2, '0');
  const hh = pad(hours);
  const mm = pad(minutes);
  const ss = pad(seconds);
  const timeStringIst = `${hh}:${mm}:${ss} IST`;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStringIst = `${days[dayOfWeek]}, ${istDate.getUTCDate()} ${months[istDate.getUTCMonth()]} ${istDate.getUTCFullYear()}`;

  return {
    isOpen,
    isPreMarket,
    statusLabel,
    statusBadge,
    timeStringIst,
    dateStringIst,
    timeUntilOpenOrClose,
  };
}

/**
 * Returns formatted relative time (e.g., '14m ago', '2h ago', 'Today, 10:15 AM', 'Yesterday')
 */
export function formatRelativeTime(dateInput: string | number | Date): string {
  if (!dateInput) return 'Recent';
  const target = new Date(dateInput).getTime();
  if (isNaN(target)) return 'Recent';

  const diffMs = Date.now() - target;
  if (diffMs < 0) return 'Scheduled';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Just now';
  }
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }
  if (diffDay === 1) {
    const d = new Date(target);
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `Yesterday, ${timeStr}`;
  }
  if (diffDay < 7) {
    return `${diffDay}d ago`;
  }

  const d = new Date(target);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Formats a YYYY-MM-DD string into "DD MMM YYYY" (e.g., "28 Sep 2026")
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return 'TBA';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[monthIdx] || ''} ${year}`;
}

/**
 * Formats date range e.g. "28 Sep – 02 Oct 2026"
 */
export function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return 'TBA';
  const start = formatDisplayDate(startDateStr);
  const end = formatDisplayDate(endDateStr);
  return `${start} to ${end}`;
}

/**
 * Utility to calculate YYYY-MM-DD offset from today
 */
export function getOffsetDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Utility to calculate ISO string with hour offset
 */
export function getOffsetIsoString(hoursOffset: number): string {
  const d = new Date(Date.now() + hoursOffset * 3600000);
  return d.toISOString();
}

/**
 * Freshens an entire database in-memory so that IPOs, dividends, news, corporate actions,
 * and market timestamps are dynamically anchored to today's real-world calendar date.
 */
export function freshenDatabaseDates<T extends {
  ipos?: IpoItem[];
  dividends?: DividendItem[];
  news?: NewsItem[];
  corporateActions?: CorporateAction[];
  lastUpdated?: string;
  indices?: MarketIndex[];
  stocks?: StockQuote[];
}>(db: T): T {
  const now = new Date();
  const nowIso = now.toISOString();

  // 1. Freshen Last Updated
  db.lastUpdated = nowIso;

  // 2. Freshen Indices Timestamps
  if (db.indices) {
    db.indices = db.indices.map((idx) => ({
      ...idx,
      timestamp: nowIso,
      quality: idx.quality ? { ...idx.quality, observedAt: nowIso, retrievedAt: nowIso } : idx.quality,
    }));
  }

  // 3. Freshen IPOs with realistic distribution around current calendar date
  if (db.ipos && db.ipos.length > 0) {
    const todayStr = getOffsetDateString(0);

    // Distribution schedule:
    // 0, 1: OPEN NOW (started 2 days ago or yesterday, closes in 1-2 days, listings in 5-6 days)
    // 2, 3, 4, 5, 6, 7: UPCOMING (starts in 3, 6, 9, 13, 17, 22 days)
    // Remaining: RECENTLY CLOSED / LISTED (started 10 days ago, closed 5 days ago, listed 2 days ago)
    db.ipos = db.ipos.map((ipo, idx) => {
      let openDate: string;
      let closeDate: string;
      let listingDate: string;
      let status: 'OPEN' | 'UPCOMING' | 'CLOSED';
      let observedAt: string;

      if (idx === 0) {
        // Mainboard Open
        openDate = getOffsetDateString(-1);
        closeDate = getOffsetDateString(2);
        listingDate = getOffsetDateString(7);
        status = 'OPEN';
        observedAt = getOffsetIsoString(-1.5);
      } else if (idx === 1) {
        // Mainboard / Tech Open
        openDate = getOffsetDateString(-2);
        closeDate = getOffsetDateString(1);
        listingDate = getOffsetDateString(6);
        status = 'OPEN';
        observedAt = getOffsetIsoString(-2.5);
      } else if (idx === 10) {
        // SME Open
        openDate = getOffsetDateString(-1);
        closeDate = getOffsetDateString(1);
        listingDate = getOffsetDateString(5);
        status = 'OPEN';
        observedAt = getOffsetIsoString(-1.0);
      } else if (idx === 11) {
        // SME Open
        openDate = getOffsetDateString(0);
        closeDate = getOffsetDateString(2);
        listingDate = getOffsetDateString(6);
        status = 'OPEN';
        observedAt = getOffsetIsoString(-0.8);
      } else if (idx >= 2 && idx <= 7) {
        // Upcoming Mainboards
        const offset = 3 + (idx - 2) * 4;
        openDate = getOffsetDateString(offset);
        closeDate = getOffsetDateString(offset + 3);
        listingDate = getOffsetDateString(offset + 8);
        status = 'UPCOMING';
        observedAt = getOffsetIsoString(-4 - idx * 2);
      } else if (idx >= 12 && idx <= 15) {
        // Upcoming SMEs
        const offset = 4 + (idx - 12) * 5;
        openDate = getOffsetDateString(offset);
        closeDate = getOffsetDateString(offset + 3);
        listingDate = getOffsetDateString(offset + 7);
        status = 'UPCOMING';
        observedAt = getOffsetIsoString(-3 - idx);
      } else {
        // Recently Closed / Listed
        openDate = getOffsetDateString(-12);
        closeDate = getOffsetDateString(-8);
        listingDate = getOffsetDateString(-3);
        status = 'CLOSED';
        observedAt = getOffsetIsoString(-48);
      }

      // Check date logic consistency against today
      if (todayStr >= openDate && todayStr <= closeDate) {
        status = 'OPEN';
      } else if (todayStr < openDate) {
        status = 'UPCOMING';
      } else {
        status = 'CLOSED';
      }

      const updatedGmp = ipo.latestGmp
        ? {
            ...ipo.latestGmp,
            observedAt,
            historicalQuotes: (ipo.latestGmp.historicalQuotes || []).map((hq, hqIdx) => ({
              ...hq,
              observedAt: getOffsetIsoString(-hqIdx * 12 - 2),
            })),
          }
        : undefined;

      const updatedSubs = (ipo.subscriptions || []).map((sub) => ({
        ...sub,
        updatedAt: observedAt,
      }));

      return {
        ...ipo,
        openDate,
        closeDate,
        listingDate,
        status,
        latestGmp: updatedGmp,
        subscriptions: updatedSubs,
      };
    });
  }

  // 4. Freshen Dividends with active upcoming ex-dividend dates
  if (db.dividends && db.dividends.length > 0) {
    db.dividends = db.dividends.map((div, idx) => {
      // Dynamic upcoming distribution schedule
      // Ex-dates in +4, +8, +14, +18, +25, +32 days
      const exOffset = idx === 0 ? 4 : idx === 1 ? 8 : idx === 2 ? 14 : idx === 3 ? 20 : idx === 4 ? 26 : (idx + 2) * 5;
      const annOffset = exOffset - 18;
      const recOffset = exOffset + 1;
      const payOffset = recOffset + 15;

      const announcementDate = getOffsetDateString(annOffset);
      const exDate = getOffsetDateString(exOffset);
      const recordDate = getOffsetDateString(recOffset);
      const paymentDate = getOffsetDateString(payOffset);

      return {
        ...div,
        announcementDate,
        exDate,
        recordDate,
        paymentDate,
        payoutDate: paymentDate,
        status: exOffset > 0 ? (div.isConfirmed ? 'DECLARED' : 'EXPECTED') : 'EXECUTED',
      };
    });
  }

  // 5. Freshen Corporate News with recent hours/today
  if (db.news && db.news.length > 0) {
    const newsHourOffsets = [-0.4, -1.5, -3.2, -5.8, -11.0, -22.5, -36.0, -52.0];
    db.news = db.news.map((item, idx) => {
      const offset = newsHourOffsets[idx % newsHourOffsets.length] || -idx * 4;
      return {
        ...item,
        publishedAt: getOffsetIsoString(offset),
      };
    });
  }

  // 6. Freshen Corporate Actions
  if (db.corporateActions && db.corporateActions.length > 0) {
    db.corporateActions = db.corporateActions.map((ca, idx) => {
      const exOffset = (idx + 1) * 6;
      return {
        ...ca,
        announcementDate: getOffsetDateString(exOffset - 14),
        exDate: getOffsetDateString(exOffset),
        recordDate: getOffsetDateString(exOffset + 1),
        status: exOffset > 0 ? 'DECLARED' : 'EXECUTED',
      };
    });
  }

  return db;
}

/**
 * Realistic price jitter simulation for live market feel.
 * Slightly adjusts stock quotes and indices by small realistic percentage movements (±0.02% to ±0.12%)
 */
export function simulateMarketTick(stocks: StockQuote[], indices: MarketIndex[]): {
  stocks: StockQuote[];
  indices: MarketIndex[];
} {
  const nowIso = new Date().toISOString();

  const updatedIndices = indices.map((idx) => {
    // 60% chance to nudge
    if (Math.random() < 0.4) return idx;
    const nudgePercent = (Math.random() * 0.12 - 0.055) / 100; // ±0.055%
    const newValue = Number((idx.currentValue * (1 + nudgePercent)).toFixed(2));
    const newChange = Number((newValue - idx.previousClose).toFixed(2));
    const newPercent = Number(((newChange / idx.previousClose) * 100).toFixed(2));
    const dayHigh = Math.max(idx.dayHigh, newValue);
    const dayLow = Math.min(idx.dayLow, newValue);

    return {
      ...idx,
      currentValue: newValue,
      change: newChange,
      percentChange: newPercent,
      dayHigh,
      dayLow,
      timestamp: nowIso,
    };
  });

  const updatedStocks = stocks.map((s) => {
    // 35% of stocks tick each cycle
    if (Math.random() < 0.65) return s;
    const nudgePercent = (Math.random() * 0.2 - 0.09) / 100; // ±0.09%
    const newPrice = Number((s.price * (1 + nudgePercent)).toFixed(2));
    const prevClose = s.previousClose ?? (s.change !== undefined ? s.price - s.change : s.price);
    const newChange = Number((newPrice - prevClose).toFixed(2));
    const newPercent = Number(((newChange / (prevClose || 1)) * 100).toFixed(2));
    const newVolume = (s.volume || 100000) + Math.floor(Math.random() * 850 + 50);

    return {
      ...s,
      price: newPrice,
      change: newChange,
      percentChange: newPercent,
      volume: newVolume,
      dayHigh: Math.max(s.dayHigh || newPrice, newPrice),
      dayLow: Math.min(s.dayLow || newPrice, newPrice),
    };
  });

  return {
    stocks: updatedStocks,
    indices: updatedIndices,
  };
}
