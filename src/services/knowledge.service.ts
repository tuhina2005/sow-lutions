import { supabase } from '../lib/supabase';

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  parent_id?: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  category_id: string;
  tags: string[];
  keywords: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  region?: string;
  crop_type?: string;
  season?: string;
  is_active: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category_id: string;
  tags: string[];
  keywords: string[];
  region?: string;
  crop_type?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  usage_count: number;
  is_active: boolean;
}

export interface PracticeItem {
  id: string;
  practice_name: string;
  description: string;
  steps: string[];
  benefits: string[];
  requirements: string[];
  category_id: string;
  crop_type?: string;
  season?: string;
  region?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  keywords: string[];
  is_active: boolean;
}

class KnowledgeService {
  /**
   * Get all agricultural categories
   */
  async getCategories(): Promise<KnowledgeCategory[]> {
    try {
      const { data, error } = await supabase
        .from('agricultural_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Add new agricultural knowledge
   */
  async addKnowledge(knowledge: Omit<KnowledgeItem, 'id' | 'is_active'>): Promise<KnowledgeItem | null> {
    try {
      const { data, error } = await supabase
        .from('agricultural_knowledge')
        .insert(knowledge)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding knowledge:', error);
      return null;
    }
  }

  /**
   * Add new FAQ
   */
  async addFAQ(faq: Omit<FAQItem, 'id' | 'usage_count' | 'is_active'>): Promise<FAQItem | null> {
    try {
      const { data, error } = await supabase
        .from('agricultural_faqs')
        .insert(faq)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding FAQ:', error);
      return null;
    }
  }

  /**
   * Add new agricultural practice
   */
  async addPractice(practice: Omit<PracticeItem, 'id' | 'is_active'>): Promise<PracticeItem | null> {
    try {
      const { data, error } = await supabase
        .from('agricultural_practices')
        .insert(practice)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding practice:', error);
      return null;
    }
  }

  /**
   * Update knowledge item
   */
  async updateKnowledge(id: string, updates: Partial<KnowledgeItem>): Promise<KnowledgeItem | null> {
    try {
      const { data, error } = await supabase
        .from('agricultural_knowledge')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating knowledge:', error);
      return null;
    }
  }

  /**
   * Update FAQ
   */
  async updateFAQ(id: string, updates: Partial<FAQItem>): Promise<FAQItem | null> {
    try {
      const { data, error } = await supabase
        .from('agricultural_faqs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      return null;
    }
  }

  /**
   * Update practice
   */
  async updatePractice(id: string, updates: Partial<PracticeItem>): Promise<PracticeItem | null> {
    try {
      const { data, error } = await supabase
        .from('agricultural_practices')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating practice:', error);
      return null;
    }
  }

  /**
   * Delete knowledge item (soft delete)
   */
  async deleteKnowledge(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agricultural_knowledge')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      return false;
    }
  }

  /**
   * Delete FAQ (soft delete)
   */
  async deleteFAQ(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agricultural_faqs')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      return false;
    }
  }

  /**
   * Delete practice (soft delete)
   */
  async deletePractice(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agricultural_practices')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting practice:', error);
      return false;
    }
  }

  /**
   * Search knowledge base
   */
  async searchKnowledge(query: string, categoryId?: string): Promise<{
    knowledge: KnowledgeItem[];
    faqs: FAQItem[];
    practices: PracticeItem[];
  }> {
    try {
      const searchConditions = `title ILIKE '%${query}%' OR content ILIKE '%${query}%' OR summary ILIKE '%${query}%'`;
      
      const knowledgeQuery = supabase
        .from('agricultural_knowledge')
        .select('*')
        .eq('is_active', true)
        .or(searchConditions);

      const faqsQuery = supabase
        .from('agricultural_faqs')
        .select('*')
        .eq('is_active', true)
        .or(`question ILIKE '%${query}%' OR answer ILIKE '%${query}%'`);

      const practicesQuery = supabase
        .from('agricultural_practices')
        .select('*')
        .eq('is_active', true)
        .or(`practice_name ILIKE '%${query}%' OR description ILIKE '%${query}%'`);

      if (categoryId) {
        knowledgeQuery.eq('category_id', categoryId);
        faqsQuery.eq('category_id', categoryId);
        practicesQuery.eq('category_id', categoryId);
      }

      const [knowledgeResult, faqsResult, practicesResult] = await Promise.all([
        knowledgeQuery.limit(10),
        faqsQuery.limit(10),
        practicesQuery.limit(10)
      ]);

      return {
        knowledge: knowledgeResult.data || [],
        faqs: faqsResult.data || [],
        practices: practicesResult.data || []
      };
    } catch (error) {
      console.error('Error searching knowledge:', error);
      return { knowledge: [], faqs: [], practices: [] };
    }
  }

  /**
   * Get analytics data for knowledge base
   */
  async getAnalytics(): Promise<{
    totalKnowledge: number;
    totalFAQs: number;
    totalPractices: number;
    topCategories: Array<{ category: string; count: number }>;
    recentActivity: Array<{ type: string; title: string; created_at: string }>;
  }> {
    try {
      const [knowledgeCount, faqsCount, practicesCount, categoriesData, recentData] = await Promise.all([
        supabase.from('agricultural_knowledge').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('agricultural_faqs').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('agricultural_practices').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('agricultural_categories').select('name'),
        supabase.from('chat_context_log').select('category_matched, created_at').order('created_at', { ascending: false }).limit(10)
      ]);

      const topCategories = categoriesData.data?.map(cat => ({
        category: cat.name,
        count: 0 // This would need a more complex query to get actual counts
      })) || [];

      const recentActivity = recentData.data?.map(item => ({
        type: 'chat_query',
        title: `Query in ${item.category_matched}`,
        created_at: item.created_at
      })) || [];

      return {
        totalKnowledge: knowledgeCount.count || 0,
        totalFAQs: faqsCount.count || 0,
        totalPractices: practicesCount.count || 0,
        topCategories,
        recentActivity
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalKnowledge: 0,
        totalFAQs: 0,
        totalPractices: 0,
        topCategories: [],
        recentActivity: []
      };
    }
  }
}

export const knowledgeService = new KnowledgeService();
