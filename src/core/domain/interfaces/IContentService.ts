
import { ContentPiece } from '../entities';

export interface IContentService {
  generateDraft(topic: string, platform: string, stylePoints?: string[]): Promise<ContentPiece>;
}
