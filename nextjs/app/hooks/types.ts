export interface ProductSearchResponse {
  Products: Array<{
    Id: number;
    ProductClassificationId: number;
    Isin: string;
    IsSecondaryMarket: boolean;
    Code: string;
    ExchangeCode: string;
    AssetId: number;
    AssetName: string;
    AssetCurrency: string;
    Currency: string;
    Status: number;
    FollowCode: string | null;
    IsSiat: boolean;
    AssetNMP: string;
    AssetIsin: string;
    AssetNMPExchangeCode: string;
    AssetDecimalPlaces: number;
    AssetRic: string;
    MarketingAssetNMPExchangeCode: string | null;
    MarketingAssetNMP: string | null;
    MarketingAssetId: number | null;
    MarketingAssetISIN: string | null;
    MarketingAssetRic: string | null;
    MigratedToOneFlow: boolean;
    MaturityDate: string;
    AssetCurrencyRaw: string;
    TodayBarrierHitDate: string | null;
    IssueDate: string;
    Venue: string | null;
    IsPanther: boolean;
    EsgEligible: string | null;
    FkAssetType: number;
    LowerBarrierInlineWarrant: number;
    UpperBarrierInlineWarrant: number;
    Distance2CorridorLowPercentInverted: string | null;
    Distance2CorridorHighPercentInverted: string | null;
    CalcDate: string;
    Bid: number;
    Offer: number;
    MaxPerformanceStrikeCurrencyPercentPA: number;
    BrokerLinks: string | null;
    LowerBarrierInlineWarrantSuffix: string;
    UpperBarrierInlineWarrantSuffix: string;
    Distance2CorridorLowPercentInvertedDecimalPlaces: number;
    Distance2CorridorHighPercentInvertedDecimalPlaces: number;
  }>;
}

export interface HistoryItem {
  Ask: number;
  Bid: number;
  Date: string;
  IndexPrice: number;
  UnderlyingPrice: number;
}

export interface Asset {
  InstrumentIdentifier: string;
  DecimalPlaces: number;
  Ric: string;
  Id: number;
  Name: string;
}

export type Product = ProductSearchResponse["Products"][number];

export interface ExtendedProduct extends Product {
  spread: string;
  daysUntilExpiry: number;
  daysRunning: number;
  rangePercent: string;
  potentialReturn: number;
  underlyingPrice: number;
  diffToUpper: string;
  diffToLower: string;
}
