
export interface IVectorStore {
  /**
   * Search for similar items by vector embedding.
   * @param collection Name of the collection/table
   * @param vector Query vector
   * @param limit Number of results
   * @param filter Optional metadata filter
   */
  search(collection: string, vector: number[], limit: number, filter?: Record<string, any>): Promise<any[]>;

  /**
   * Store an item with its vector embedding.
   * @param collection Name of the collection/table
   * @param item Item to store (must include or be mapped to vector)
   */
  add(collection: string, item: any): Promise<void>;
  
  /**
   * Create an embedding for a text string.
   */
  embed(text: string): Promise<number[]>;
}
