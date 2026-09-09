import { IpoItem, GmpObservation } from '../../src/types/index.ts';
import { dbService } from '../db/database.ts';

export class IndianSharesIpoEngine {
  public static calculateDemandScore(ipo: IpoItem): number {
    const qib = ipo.subscriptions.find((s) => s.category === 'QIB')?.timesSubscribed || 0;
    const nii = ipo.subscriptions.find((s) => s.category === 'NII')?.timesSubscribed || 0;
    const retail = ipo.subscriptions.find((s) => s.category === 'Retail')?.timesSubscribed || 0;

    // Weight QIB more strongly (45%), NII (35%), Retail (20%)
    // Normalize logarithmic subscription scale
    const normalize = (times: number, maxExpected: number) => {
      if (times <= 0) return 30;
      if (times >= maxExpected) return 100;
      return Math.round(30 + (times / maxExpected) * 70);
    };

    const maxQib = ipo.ipoType === 'SME' ? 25 : 15;
    const maxNii = ipo.ipoType === 'SME' ? 50 : 25;
    const maxRetail = ipo.ipoType === 'SME' ? 30 : 10;

    const qibScore = normalize(qib, maxQib);
    const niiScore = normalize(nii, maxNii);
    const retailScore = normalize(retail, maxRetail);

    const weighted = Math.round(qibScore * 0.45 + niiScore * 0.35 + retailScore * 0.20);
    return Math.min(99, Math.max(20, weighted));
  }

  public static calculateGmpSupportScore(latestGmp?: GmpObservation): {
    score: number;
    category: 'Strong Positive Support' | 'Positive Support' | 'Neutral' | 'Weak' | 'Negative' | 'Unavailable';
    summary: string;
  } {
    if (!latestGmp || latestGmp.gmpValue === undefined) {
      return {
        score: 0,
        category: 'Unavailable',
        summary: 'Awaiting verified grey market transaction observations.',
      };
    }

    const prem = latestGmp.estimatedPremiumPercent;
    let score = 50;
    let category: 'Strong Positive Support' | 'Positive Support' | 'Neutral' | 'Weak' | 'Negative' | 'Unavailable' = 'Neutral';

    if (prem >= 30) {
      score = Math.min(96, Math.round(75 + prem * 0.35));
      category = 'Strong Positive Support';
    } else if (prem >= 12) {
      score = Math.round(65 + (prem - 12) * 0.7);
      category = 'Positive Support';
    } else if (prem >= 0) {
      score = Math.round(45 + prem * 1.5);
      category = 'Neutral';
    } else {
      score = Math.max(15, Math.round(40 + prem));
      category = 'Negative';
    }

    const summary =
      category === 'Strong Positive Support'
        ? `Indicative grey market premium of ${prem.toFixed(1)}% (+₹${latestGmp.gmpValue}) indicates substantial pre-listing demand; subject to broader market momentum.`
        : category === 'Positive Support'
        ? `Indicative GMP reflects healthy interest at +₹${latestGmp.gmpValue} (${prem.toFixed(1)}% over upper band).`
        : `Indicative GMP suggests moderate or flat grey market activity (+₹${latestGmp.gmpValue}).`;

    return { score, category, summary };
  }

  public static getEnrichedIpos(type?: 'MAINBOARD' | 'SME'): IpoItem[] {
    const db = dbService.getDb();
    const list = type ? db.ipos.filter((i) => i.ipoType === type) : db.ipos;

    return list.map((ipo) => {
      const demandScore = this.calculateDemandScore(ipo);
      const gmpSupport = this.calculateGmpSupportScore(ipo.latestGmp);

      // Overall IPO Score calculation
      const businessScore = ipo.ipoType === 'MAINBOARD' ? 84 : 78;
      const financialsScore = ipo.issueSizeCr > 1000 ? 80 : 75;
      const valuationScore = ipo.priceBandMax > 0 ? 76 : 65;
      const marketSectorScore = 80;

      const total = Math.round(
        businessScore * 0.20 +
          financialsScore * 0.15 +
          valuationScore * 0.15 +
          demandScore * 0.25 +
          gmpSupport.score * 0.15 +
          marketSectorScore * 0.10
      );

      const riskLevel: 'Low' | 'Medium' | 'High' = ipo.ipoType === 'SME' ? 'High' : total >= 80 ? 'Low' : 'Medium';

      return {
        ...ipo,
        scores: {
          demandScore,
          gmpSupportScore: gmpSupport,
          overallIpoScore: {
            total,
            business: businessScore,
            financials: financialsScore,
            valuation: valuationScore,
            subscription: demandScore,
            gmpSupport: gmpSupport.score,
            marketSector: marketSectorScore,
            riskLevel,
          },
        },
      };
    });
  }
}
