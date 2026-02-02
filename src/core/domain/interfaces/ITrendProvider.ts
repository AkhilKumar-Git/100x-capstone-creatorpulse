
import { Trend } from '../entities';

export interface TrendContext {
  niche: string;
  audience: string;
  geo: string;
}

export interface ITrendProvider {
  name: string;
  fetchTrends(context: TrendContext): Promise<Trend[]>;
}
