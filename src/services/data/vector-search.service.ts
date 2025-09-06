import { supabase } from '../../lib/supabase';

export interface VectorDocument {
  doc_id: number;
  title: string;
  content: string;
  content_type: string;
  language: string;
  region?: string;
  crop_category?: string;
  metadata?: any;
  similarity?: number;
}

export interface SearchResult {
  documents: VectorDocument[];
  totalResults: number;
  searchTime: number;
}

class VectorSearchService {
  /**
   * Generate embeddings for text using OpenAI API
   * Note: In production, you would use OpenAI's embedding API
   * For now, we'll use a simple text similarity approach
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // This is a placeholder implementation
    // In production, you would call OpenAI's embedding API:
    // const response = await openai.embeddings.create({
    //   model: "text-embedding-ada-002",
    //   input: text,
    // });
    // return response.data[0].embedding;
    
    // Simple hash-based embedding for demo purposes
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(1536).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const position = hash % 1536;
      embedding[position] += 1;
    });
    
    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Add document to vector database
   */
  async addDocument(
    title: string,
    content: string,
    contentType: string = 'agricultural_knowledge',
    language: string = 'en',
    region?: string,
    cropCategory?: string,
    metadata?: any
  ): Promise<VectorDocument | null> {
    try {
      const embedding = await this.generateEmbedding(content);
      
      const { data, error } = await supabase
        .from('Vector_Documents')
        .insert({
          title,
          content,
          content_type: contentType,
          language,
          region,
          crop_category: cropCategory,
          embedding: `[${embedding.join(',')}]`,
          metadata
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding document to vector database:', error);
      return null;
    }
  }

  /**
   * Search for similar documents using vector similarity
   */
  async searchSimilarDocuments(
    query: string,
    limit: number = 5,
    contentType?: string,
    language?: string,
    region?: string,
    cropCategory?: string
  ): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Build the similarity search query
      let queryBuilder = supabase
        .from('Vector_Documents')
        .select('*')
        .limit(limit);

      // Add filters if provided
      if (contentType) {
        queryBuilder = queryBuilder.eq('content_type', contentType);
      }
      if (language) {
        queryBuilder = queryBuilder.eq('language', language);
      }
      if (region) {
        queryBuilder = queryBuilder.eq('region', region);
      }
      if (cropCategory) {
        queryBuilder = queryBuilder.eq('crop_category', cropCategory);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      // Calculate similarity scores
      const documentsWithSimilarity = (data || []).map(doc => {
        const similarity = this.calculateCosineSimilarity(queryEmbedding, doc.embedding);
        return {
          ...doc,
          similarity
        };
      });

      // Sort by similarity
      documentsWithSimilarity.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

      const searchTime = Date.now() - startTime;

      return {
        documents: documentsWithSimilarity,
        totalResults: documentsWithSimilarity.length,
        searchTime
      };
    } catch (error) {
      console.error('Error searching vector database:', error);
      return {
        documents: [],
        totalResults: 0,
        searchTime: Date.now() - startTime
      };
    }
  }

  /**
   * Search using text similarity (fallback method)
   */
  async searchByTextSimilarity(
    query: string,
    limit: number = 5,
    contentType?: string,
    language?: string
  ): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const queryWords = query.toLowerCase().split(/\s+/);
      
      let queryBuilder = supabase
        .from('Vector_Documents')
        .select('*')
        .limit(limit * 2); // Get more results for filtering

      if (contentType) {
        queryBuilder = queryBuilder.eq('content_type', contentType);
      }
      if (language) {
        queryBuilder = queryBuilder.eq('language', language);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      // Calculate text similarity scores
      const documentsWithSimilarity = (data || []).map(doc => {
        const similarity = this.calculateTextSimilarity(queryWords, doc.title + ' ' + doc.content);
        return {
          ...doc,
          similarity
        };
      });

      // Filter and sort by similarity
      const filteredDocs = documentsWithSimilarity
        .filter(doc => (doc.similarity || 0) > 0.1)
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
        .slice(0, limit);

      const searchTime = Date.now() - startTime;

      return {
        documents: filteredDocs,
        totalResults: filteredDocs.length,
        searchTime
      };
    } catch (error) {
      console.error('Error searching by text similarity:', error);
      return {
        documents: [],
        totalResults: 0,
        searchTime: Date.now() - startTime
      };
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate text similarity based on word overlap
   */
  private calculateTextSimilarity(queryWords: string[], text: string): number {
    const textWords = text.toLowerCase().split(/\s+/);
    const querySet = new Set(queryWords);
    const textSet = new Set(textWords);

    const intersection = new Set([...querySet].filter(x => textSet.has(x)));
    const union = new Set([...querySet, ...textSet]);

    return intersection.size / union.size;
  }

  /**
   * Get documents by category
   */
  async getDocumentsByCategory(
    cropCategory: string,
    limit: number = 10
  ): Promise<VectorDocument[]> {
    try {
      const { data, error } = await supabase
        .from('Vector_Documents')
        .select('*')
        .eq('crop_category', cropCategory)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting documents by category:', error);
      return [];
    }
  }

  /**
   * Get documents by region
   */
  async getDocumentsByRegion(
    region: string,
    limit: number = 10
  ): Promise<VectorDocument[]> {
    try {
      const { data, error } = await supabase
        .from('Vector_Documents')
        .select('*')
        .eq('region', region)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting documents by region:', error);
      return [];
    }
  }

  /**
   * Update document embedding
   */
  async updateDocumentEmbedding(docId: number): Promise<boolean> {
    try {
      // Get the document
      const { data: doc, error: fetchError } = await supabase
        .from('Vector_Documents')
        .select('content')
        .eq('doc_id', docId)
        .single();

      if (fetchError || !doc) return false;

      // Generate new embedding
      const embedding = await this.generateEmbedding(doc.content);

      // Update the document
      const { error: updateError } = await supabase
        .from('Vector_Documents')
        .update({
          embedding: `[${embedding.join(',')}]`,
          updated_at: new Date().toISOString()
        })
        .eq('doc_id', docId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error updating document embedding:', error);
      return false;
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(docId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Vector_Documents')
        .delete()
        .eq('doc_id', docId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }
}

export const vectorSearchService = new VectorSearchService();
