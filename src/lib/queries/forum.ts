import { supabase } from '../supabase';

export async function fetchPosts(categoryId = 'all', searchQuery = '') {
  let query = supabase
    .from('forum_posts')
    .select()
    .order('created_at', { ascending: false }); // Select all fields from `forum_posts`
    // .order('created_at', { ascending: false });
    
  // console.log(data);
  if (categoryId !== 'all') {
    query = query.eq('category_id', categoryId);
  }

  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }
  const { data, error } = await query;
  // const { data, error } = await query;
  console.log('data', data);
  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }

  // Fetch related data manually
  const postsWithRelations = await Promise.all(
    data.map(async post => {
      // Fetch user email manually
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', post.user_id)
        .single();

      // Fetch category data manually
      const { data: category } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('id', post.category_id)
        .single();

      // Fetch comment and like counts manually
      const { count: commentCount } = await supabase
        .from('forum_comments')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id);

      const { count: likeCount } = await supabase
        .from('forum_likes')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id);

      return {
        ...post,
        user: { email: profile?.email || null },
        category: category || null,
        _count: {
          comments: commentCount || 0,
          likes: likeCount || 0,
        },
      };
    })
  );

  return postsWithRelations;
}

export async function fetchPost(id) {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('id', id)
    .order('created_at', { ascending: false })
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    throw error;
  }

  // Fetch related data manually
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', data.user_id)
    .single();

  const { data: category } = await supabase
    .from('forum_categories')
    .select('name')
    .eq('id', data.category_id)
    .single();

  const { data: likes } = await supabase
    .from('forum_likes')
    .select('id')
    .eq('post_id', id);

  return {
    ...data,
    user: { email: profile?.email || null },
    category: category?.name || null,
    likes: likes || [],
  };
}

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('forum_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  // Fetch related data manually
  const commentsWithRelations = await Promise.all(
    data.map(async comment => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', comment.user_id)
        .single();

      const { data: likes } = await supabases
        .from('forum_likes')
        .select('id')
        .eq('comment_id', comment.id);

      return {
        ...comment,
        user: { email: profile?.email || null },
        likes: likes || [],
      };
    })
  );

  return commentsWithRelations;
}

export async function createComment(postId, content) {
  const { error } = await supabase
    .from('forum_comments')
    .insert({
      content,
      post_id: postId,
    })
    ;

  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

export async function fetchCategories() {
  const { data: categories, error } = await supabase
    .from('forum_categories')
    .select('*'); // Fetch all categories

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  // Fetch post counts for each category
  const categoriesWithPostCounts = await Promise.all(
    categories.map(async category => {
      const { count: count, error: countError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact' }) // Count posts in each category
        .eq('category_id', category.id);

      if (countError) {
        console.error(`Error fetching post count for category ${category.id}:`, countError);
        throw countError;
      }

      return {
        ...category,
        count: count || 0, // Add post count to the category
      };
    })
  );

  return categoriesWithPostCounts;
}
