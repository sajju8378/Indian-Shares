import { DividendItem } from '../../src/types/index.ts';
import { dbService } from '../db/database.ts';

export class IndianSharesDividendEngine {
  public static getAllDividends(): DividendItem[] {
    const db = dbService.getDb();
    return db.dividends.map((item) => {
      // Refresh score calculation
      const fund = db.fundamentals[item.symbol];
      const val = db.valuation[item.symbol];

      let score = 70;
      let rating: 'Strong' | 'Good' | 'Average' | 'Weak' | 'Unavailable' = 'Good';
      let consistency = 'Regular periodic shareholder distributions';
      let growthQuality = 'Standard dividend growth';
      let payoutSustainability = 'Adequate';
      let cashFlowSupport = 'Covered by operations';

      if (fund) {
        if (fund.debtToEquity <= 0.1 && fund.freeCashFlowCr > 1000 && item.dividendYield > 2.0) {
          score = 92;
          rating = 'Strong';
          consistency = 'Over 10+ consecutive years of regular payouts';
          growthQuality = 'High dividend yield supported by durable cash conversion';
          payoutSustainability = 'Very High (Zero net debt, high free cash flow)';
          cashFlowSupport = 'Strongly protected by operating cash flows';
        } else if (fund.debtToEquity <= 0.5 && fund.freeCashFlowCr > 0) {
          score = 82;
          rating = 'Good';
          consistency = 'Regular track record with growing payout distribution';
          growthQuality = 'Healthy balance between dividend payout and capex reinvestment';
          payoutSustainability = 'High';
          cashFlowSupport = 'Covered by operating cash flow';
        } else if (fund.debtToEquity > 1.5) {
          score = 55;
          rating = 'Average';
          consistency = 'Cyclical dividend history';
          growthQuality = 'Constrained by higher leverage obligations';
          payoutSustainability = 'Moderate';
          cashFlowSupport = 'Requires monitoring during capital cycle turns';
        }
      }

      return {
        ...item,
        dividendScore: {
          score,
          rating,
          consistency,
          growthQuality,
          payoutSustainability,
          cashFlowSupport,
        },
      };
    });
  }

  public static getStockDividends(symbol: string): DividendItem[] {
    return this.getAllDividends().filter((d) => d.symbol.toUpperCase() === symbol.toUpperCase());
  }
}
