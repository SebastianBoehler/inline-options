"use client";

import { useState, useEffect } from "react";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";

type MetricSection = {
  key: string;
  title: string;
  summary: string;
  interpretation: string[];
  calculation: string;
  category: "risk" | "probability" | "pricing" | "scoring";
};

const metricSections: MetricSection[] = [
  {
    key: "sigma-distance",
    title: "Sigma Distance (Sigma ↓ / Sigma ↑)",
    summary:
      "Measures how many standard deviations the underlying price can move before touching the lower or upper barrier.",
    interpretation: [
      "Higher values mean the product can absorb larger price swings before knocking out.",
      "Values below about 1 indicate the corridor is tight and even moderate volatility may breach it.",
      "Used as an input to the Opt Score (via the minimum of both sides).",
    ],
    calculation:
      "Sigma ↓ = ln(Price / LowerBarrier) / (sigma * sqrt(T)) and Sigma ↑ = ln(UpperBarrier / Price) / (sigma * sqrt(T)). sigma is the annualised volatility estimated from the last 20 sessions and T is time to maturity expressed in trading years. When sigma is zero the app treats in-corridor products as very safe (50) and others as zero.",
    category: "risk",
  },
  {
    key: "prob-stay",
    title: "Prob Stay",
    summary:
      "Probability that the underlying finishes inside the barrier corridor by maturity under a log-normal diffusion assumption.",
    interpretation: [
      "Expressed between 0 and 1 and displayed as a percentage in the table.",
      "Higher probabilities favour stable products and are rewarded in both the Opt Score and expected value metrics.",
      "Sensitive to volatility estimates and the distance to both barriers.",
    ],
    calculation:
      "Prob Stay = Phi(zUpper) - Phi(zLower) with zLower = (ln(LowerBarrier / Price) - muT) / (sigma * sqrt(T)) and zUpper = (ln(UpperBarrier / Price) - muT) / (sigma * sqrt(T)). muT = -0.5 * sigma^2 * T captures the drift that keeps discounted prices martingales. Results are clamped to the [0, 1] interval.",
    category: "probability",
  },
  {
    key: "expected-profit",
    title: "Exp Profit",
    summary:
      "Expected payoff in absolute EUR assuming the product redeems 10 EUR when it survives the corridor.",
    interpretation: [
      "Positive values imply the survival payoff outweighs the entry price on average.",
      "Pairs naturally with Exp Return to communicate scale as well as efficiency.",
    ],
    calculation:
      "Exp Profit = 10 * Prob Stay - Offer. The 10 EUR reflects the nominal redemption of inline warrants.",
    category: "pricing",
  },
  {
    key: "expected-return",
    title: "Exp Return",
    summary:
      "Expected percentage return based on the same survival probability assumption.",
    interpretation: [
      "Provides a capital-efficiency view of the expected payoff relative to the entry price.",
      "Helps compare products with different absolute prices.",
    ],
    calculation:
      "Exp Return = (Exp Profit / Offer) * 100. Reported as a percentage in the table.",
    category: "pricing",
  },
  {
    key: "black-scholes-price",
    title: "Black Scholes",
    summary:
      "Risk-neutral fair value of the inline warrant calculated from the Black–Scholes double-no-touch probability.",
    interpretation: [
      "Values above the current Offer imply the market is charging less than the model fair value.",
      "Matches 10 × Prob Stay when interest rates are assumed to be negligible over the remaining term.",
      "Used alongside the BS Signal column to highlight potential mispricings.",
    ],
    calculation:
      "Black Scholes = 10 × Prob Stay. The payoff of 10 EUR is multiplied by the risk-neutral probability of surviving inside the barrier corridor.",
    category: "pricing",
  },
  {
    key: "black-scholes-signal",
    title: "BS Signal",
    summary:
      "Discretionary trade signal based on the difference between the Black Scholes fair value and the quoted offer price.",
    interpretation: [
      "Buy indicates the model value exceeds the offer by more than 0.15 EUR.",
      "Sell is triggered when the offer is at least 0.15 EUR richer than the model value.",
      "Fair means the discrepancy is within the neutral band.",
    ],
    calculation:
      "If Black Scholes − Offer > 0.15 → Buy, if < −0.15 → Sell, otherwise Fair. The 0.15 EUR threshold avoids spurious signals from small rounding differences.",
    category: "pricing",
  },
  {
    key: "score",
    title: "Score",
    summary:
      "Composite ranking that blends potential return, buffer to barriers, technical indicators and time to expiry.",
    interpretation: [
      "Higher scores highlight products with attractive risk/return balance within the currently loaded result set.",
      "Because each input is min-max normalised per query, scores are relative to the filtered universe rather than absolute thresholds.",
    ],
    calculation:
      "Score = 0.25 * Rp * Pfactor + 0.2 * Dp + 0.15 * (1 - Bp) + 0.15 * (1 - Vp) + 0.25 * Tp. Rp, Dp, Bp, Vp and Tp are min-max normalised versions of potential return, minimum distance to either barrier, Bollinger band width, 95% option VaR and days until expiry. Pfactor = 1 - Offer / max(Offer) rewards cheaper entry prices.",
    category: "scoring",
  },
  {
    key: "opt-score",
    title: "Opt Score",
    summary:
      "Optimised blend emphasising survival probability and expected return while penalising tail risk.",
    interpretation: [
      "Always lives between 0 and 1 because each ingredient is normalised within the current dataset.",
      "Favours products that combine high Prob Stay with solid expected returns and reasonable distance to barriers.",
    ],
    calculation:
      "Opt Score = 0.45 * Prob + 0.3 * ExpRet + 0.15 * Sigma + 0.1 * (1 - Vp). Prob, ExpRet and Sigma are the min-max normalised versions of Prob Stay, Exp Return and the tighter sigma distance; Vp is the normalised option VaR so lower risk (smaller VaR) increases the score.",
    category: "scoring",
  },
  {
    key: "opitz-score",
    title: "Opitz Score",
    summary:
      "Legacy heuristic (\"Opitz formula\") combining potential return, entry price and technical stability.",
    interpretation: [
      "Higher when the payoff is large relative to the offer price and when the underlying trades in a tight Bollinger corridor with low VaR.",
      "Acts as an additional cross-check next to the newer Score and Opt Score columns.",
    ],
    calculation:
      "Opitz Score = 0.42 * potentialReturn * (10 - Offer) + 0.34 / BollingerWidth + 0.16 / VaR95. Uses the same 10 EUR nominal and the 20 day Bollinger width and VaR estimates derived from price history.",
    category: "scoring",
  },
];

export default function MetricsPage() {
  const [activeSection, setActiveSection] = useState<string>("");
  const [expandedFormulas, setExpandedFormulas] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const sections = metricSections.map(s => s.key);
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFormula = (key: string) => {
    setExpandedFormulas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const scrollToSection = (key: string) => {
    const element = document.getElementById(key);
    if (element) {
      const headerOffset = 80; // Account for sticky header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const categoryGroups = {
    risk: metricSections.filter(s => s.category === 'risk'),
    probability: metricSections.filter(s => s.category === 'probability'),
    pricing: metricSections.filter(s => s.category === 'pricing'),
    scoring: metricSections.filter(s => s.category === 'scoring'),
  };

  return (
    <main>
      <Container className="py-6">
        <div className="flex gap-8">
          {/* Sticky TOC Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Navigation</h3>
              <nav className="space-y-4">
                {Object.entries(categoryGroups).map(([category, sections]) => (
                  <div key={category}>
                    <h4 className="text-xs font-medium text-gray-700 capitalize mb-2">{category}</h4>
                    <ul className="space-y-1">
                      {sections.map((section) => (
                        <li key={section.key}>
                          <button
                            onClick={() => scrollToSection(section.key)}
                            className={`text-xs text-left w-full px-2 py-1 rounded transition-colors ${
                              activeSection === section.key
                                ? 'bg-gray-100 text-gray-900 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {section.title.split(' ')[0]}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <h1 className="text-xl font-semibold text-gray-900">Metric Reference</h1>
              <p className="mt-2 max-w-3xl text-sm text-gray-600">
                Each column in the dashboard summarises a different aspect of an inline warrant. The notes
                below explain what the metrics capture, how to interpret large or small values, and the
                formulas used in the app when calculating them from Societe Generale market data.
              </p>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {metricSections.map((section) => (
                <Card key={section.key} className="p-0">
                  <div id={section.key} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-base font-semibold text-gray-900">{section.title}</h2>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1">
                        {section.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{section.summary}</p>
                    
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">Interpretation</h3>
                      <ul className="space-y-1">
                        {section.interpretation.map((item) => (
                          <li key={item} className="text-sm text-gray-600 flex items-start">
                            <span className="text-gray-400 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => toggleFormula(section.key)}
                        className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${expandedFormulas.has(section.key) ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Formula
                      </button>
                      {expandedFormulas.has(section.key) && (
                        <div className="mt-2 p-3 bg-gray-50 border border-gray-200">
                          <p className="text-xs text-gray-700 font-mono leading-relaxed">
                            {section.calculation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
