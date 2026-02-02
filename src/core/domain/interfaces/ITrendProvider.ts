
import { Trend } from '../entities';

export interface TrendContext {
  niche: string;
  audience: string;
  geo: string;
  topic?: string;
}

export interface ITrendProvider {
  name: string;
  fetchTrends(context: TrendContext): Promise<Trend[]>;
}
