# IndianShares - Indian Stock Market Research & Intelligence

A modern, institutional-grade Indian equity research and primary market intelligence desk built with React, TypeScript, Tailwind CSS, and Express.

![IndianShares Desk](public/assets/preview.png)

## Features

- **Market Desk**: Real-time NSE/BSE indices (Nifty 50, Sensex, Bank Nifty, Midcap 100), market breadth advance/decline ratios, sectoral heatmaps, and financial news feeds.
- **Top 10 IndianShares Scoring Desk**: Multi-factor quantitative scoring engine evaluating Return on Equity (ROE), Return on Capital Employed (ROCE), debt-to-equity leverage, 3-year CAGR growth, momentum, and risk penalties.
- **Primary Market & IPO Intelligence**: Comprehensive tracking of Mainboard and SME IPO offerings, bidding dates, lot sizes, subscription demand multiples, and indicative Grey Market Premium (GMP) support scores.
- **Shares Suggested by Institutions**: Systematic tracking of FII/FPI and Mutual Fund stake accumulation patterns from quarterly regulatory shareholding disclosures.
- **Dividends Desk**: High-yield dividend stocks, ex-dates, sustainability scores, and payout ratios.
- **Interactive Stock Screener**: Multi-variable filter matrix for price, sector, P/E, ROE, ROCE, debt-to-equity, and dividend yields.
- **Personal Watchlist & Research Notebook**: Client-persisted watchlists and thesis notes with custom factor weights.

---

## Deploying to GitHub Pages (2 Steps)

This project includes an automated GitHub Actions deployment workflow (`.github/workflows/deploy.yml`).

### Step 1: Push Changes to GitHub
Commit and push the latest repository changes (including `.github/workflows/deploy.yml` and `vite.config.ts`) to your GitHub repository:
```bash
git add .
git commit -m "Configure GitHub Actions deployment and relative paths"
git push origin main
```

### Step 2: Enable GitHub Actions Deployment in Settings
1. Go to your repository on GitHub: `https://github.com/sajju8378/Indian-Shares`
2. Click on **Settings** (top right tab of your repository).
3. In the left sidebar, click on **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** > **Source**, change the dropdown from **"Deploy from a branch"** to **"GitHub Actions"**.
5. That's it! GitHub will automatically run the build workflow and publish your site at:
   `https://sajju8378.github.io/Indian-Shares/`

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build for production
npm run build
```

---

## Disclaimer
This application is built for educational, quantitative screening, and market analytical research purposes. It does not provide personalized investment advice, stock recommendations, or SEBI-registered portfolio management services. Always conduct your own research or consult a SEBI-registered financial advisor before making investment decisions.
