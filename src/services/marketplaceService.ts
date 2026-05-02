import { supabase } from '../supabaseClient';

export interface JobRecord {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  location: string | null;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  created_at: string;
  completed_at?: string | null;
}

export interface MessageRecord {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  expires_at: string;
  created_at: string;
}

export interface TalentProfileRecord {
  id: string;
  full_name: string | null;
  display_name?: string | null;
  role: 'client' | 'freelancer' | null;
  bio: string | null;
  headline?: string | null;
  skills?: string[] | string | null;
  location: string | null;
  hourly_rate: number | null;
  avatar_url: string | null;
  profile_image?: string | null;
  created_at: string;
  updated_at?: string;
}

const formatBudget = (budgetMin: number | null, budgetMax: number | null) => {
  if (budgetMin && budgetMax) {
    if (budgetMin === budgetMax) return `SLE ${budgetMax}`;
    return `SLE ${budgetMin} - SLE ${budgetMax}`;
  }
  if (budgetMin) return `SLE ${budgetMin}+`;
  if (budgetMax) return `SLE ${budgetMax}`;
  return 'Budget not specified';
};

const formatPostedAt = (createdAt: string) => {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const minutes = Math.max(1, Math.floor((now - created) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export const makeChatId = (uid1: string, uid2: string) => [uid1, uid2].sort().join('_');

export const fetchJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, client_id, title, description, category, budget_min, budget_max, location, status, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((job) => ({
    ...job,
    budget: formatBudget(job.budget_min, job.budget_max),
    postedAt: formatPostedAt(job.created_at),
  })) as Array<JobRecord & { budget: string; postedAt: string }>;
};

export const fetchJobsByClientId = async (clientId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, client_id, title, description, category, budget_min, budget_max, location, status, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((job) => ({
    ...job,
    budget: formatBudget(job.budget_min, job.budget_max),
    postedAt: formatPostedAt(job.created_at),
  }));
};

export const fetchCompletedJobsByFreelancerId = async (freelancerId: string) => {
  const { data, error } = await supabase
    .from('applications')
    .select('job_id, jobs(id, title, description, category, budget_min, budget_max, location, status, created_at)')
    .eq('freelancer_id', freelancerId)
    .eq('status', 'accepted');

  if (error) throw error;
  const apps = (data ?? []) as unknown as Array<{ jobs: JobRecord }>;
  return apps
    .filter((app) => app.jobs.status === 'completed' || app.jobs.status === 'closed')
    .map((app) => ({
      ...app.jobs,
      budget: formatBudget(app.jobs.budget_min, app.jobs.budget_max),
      postedAt: formatPostedAt(app.jobs.created_at),
    }));
};

export const createJob = async (payload: {
  title: string;
  description: string;
  category: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  location?: string | null;
}) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('You must be logged in to create a job.');

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      client_id: user.id,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      budget_min: payload.budgetMin ?? null,
      budget_max: payload.budgetMax ?? null,
      location: payload.location ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as JobRecord;
};

export const applyToJob = async (jobId: string, coverLetter: string, attachmentUrl?: string | null) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('You must be logged in to apply.');

  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      freelancer_id: user.id,
      cover_letter: coverLetter,
      attachment_url: attachmentUrl ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const hasAppliedToJob = async (jobId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('freelancer_id', user.id)
    .maybeSingle();

  if (error) return false;
  return !!data;
};

export const sendMessage = async (payload: {
  chatId: string;
  receiverId: string;
  body: string;
}) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('You must be logged in to send a message.');

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: payload.chatId,
      sender_id: user.id,
      receiver_id: payload.receiverId,
      body: payload.body,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data as MessageRecord;
};

export const fetchChatMessages = async (chatId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('id, chat_id, sender_id, receiver_id, body, expires_at, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MessageRecord[];
};

export const createReview = async (payload: {
  freelancerId: string;
  rating: number;
  comment?: string | null;
}) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('You must be logged in to leave a review.');

  // Check if review already exists for this freelancer from this reviewer
  const { data: existingReview, error: checkError } = await supabase
    .from('reviews')
    .select('id')
    .eq('reviewer_id', user.id)
    .eq('freelancer_id', payload.freelancerId)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existingReview) {
    throw new Error('You already reviewed this freelancer.');
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      reviewer_id: user.id,
      freelancer_id: payload.freelancerId,
      rating: payload.rating,
      comment: payload.comment ?? null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchTalentProfiles = async () => {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('*')
    .ilike('role', 'freelancer')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return (data ?? []) as TalentProfileRecord[];
};

export const fetchTalentProfileById = async (profileId: string) => {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, full_name, role, bio, location, hourly_rate, avatar_url, created_at')
    .eq('id', profileId)
    .single();

  if (error) throw error;
  return data as TalentProfileRecord;
};

export const fetchProfilesByIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, full_name, avatar_url')
    .in('id', ids);

  if (error) throw error;
  return data as Array<{ id: string; full_name: string | null; avatar_url: string | null }>;
};

export const updateProfile = async (profileId: string, updates: any) => {
  const { data, error } = await supabase
    .from('public_profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data as TalentProfileRecord;
};

export const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/profile/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('SaloneFreelance-Profiles')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('SaloneFreelance-Profiles')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const uploadDocument = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/documents/cv.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('SaloneFreelance-Documents')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  return filePath;
};

export const getDocumentUrl = async (path: string) => {
  const { data, error } = await supabase.storage
    .from('SaloneFreelance-Documents')
    .createSignedUrl(path, 60 * 60); // 1 hour

  if (error) throw error;
  return data.signedUrl;
};

export const fetchReviewsForFreelancer = async (freelancerId: string) => {
  try {
    const { data, error } = await supabase.from('reviews').select('*');
    if (error || !data) return [];
    
    return data.filter(r => {
      const dbId = r.freelancer_id || r.freelancerId || r.freelancer || '';
      return String(dbId).toLowerCase() === String(freelancerId).toLowerCase();
    });
  } catch (e) {
    return [];
  }
};

export const deleteUserFiles = async (userId: string) => {
  const buckets = ['SaloneFreelance-Profiles', 'SaloneFreelance-Documents'];
  
  for (const bucket of buckets) {
    try {
      const pathsToSearch = [userId, `${userId}/profile`, `${userId}/documents`];
      let filesToRemove: string[] = [];

      for (const searchPath of pathsToSearch) {
        const { data: items, error: listError } = await supabase.storage
          .from(bucket)
          .list(searchPath);

        if (listError) {
          continue;
        }

        if (items && items.length > 0) {
          items.forEach(item => {
            // In Supabase, folders usually don't have an id, files do.
            // Or we just check if there is a '.' in the name (simple heuristic)
            if (item.id || item.name.includes('.')) {
              filesToRemove.push(`${searchPath}/${item.name}`);
            }
          });
        }
      }

      if (filesToRemove.length > 0) {
        const { error: removeError } = await supabase.storage
          .from(bucket)
          .remove(filesToRemove);

        if (removeError) {
          console.error(`Error removing files from bucket ${bucket}:`, removeError);
        }
      }
    } catch (err) {
      console.error(`Unexpected error cleaning up bucket ${bucket}:`, err);
    }
  }
};

export const deleteUserAccount = async (userId: string) => {
  try {
    // 1. Clean up storage files first while we still have access
    await deleteUserFiles(userId);

    // 2. Delete the user's profile from public_profiles
    // (If foreign keys have ON DELETE CASCADE, this might be redundant if we delete auth user, 
    // but good for completeness if we can't delete auth user directly)
    const { error: profileError } = await supabase
      .from('public_profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // Note: We cannot delete the user from auth.users from the client-side 
    // without a service role key or an Edge Function.
    // The user will need to either:
    // a) Call an Edge Function that handles the deletion of the auth user
    // b) Manually delete the user from the Supabase dashboard (and our SQL trigger will handle the rest)
    
    return { success: true };
  } catch (err) {
    console.error('Unexpected error during account deletion:', err);
    throw err;
  }
};

export const fetchApplicationsByJobId = async (jobId: string) => {
  const { data, error } = await supabase
    .from('applications')
    .select('*') // Get raw applications first
    .eq('job_id', jobId);

  if (error) {
    console.error('Supabase Error fetching applications:', error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Now manually attach profile info to avoid join issues
  const applicationsWithProfiles = await Promise.all(
    data.map(async (app) => {
      const { data: profile } = await supabase
        .from('public_profiles')
        .select('full_name, avatar_url, bio')
        .eq('id', app.freelancer_id)
        .single();
      
      return {
        ...app,
        freelancer: profile
      };
    })
  );

  return applicationsWithProfiles;
};

export const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
  // 1. Update application status
  const { data: appData, error: appError } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single();

  if (appError) throw appError;

  // 2. If accepted, update job status to 'in_progress'
  if (status === 'accepted') {
    const { error: jobError } = await supabase
      .from('jobs')
      .update({ status: 'in_progress' })
      .eq('id', appData.job_id);

    if (jobError) console.error('Error updating job status:', jobError);
  }

  return appData;
};

export const deleteJob = async (jobId: string) => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId);

  if (error) throw error;
  return { success: true };
};

export const markJobAsCompleted = async (jobId: string) => {
  try {
    // Attempt 1: Try with completed_at
    const { data, error } = await supabase
      .from('jobs')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();

    if (!error) return data;
    
    // If it's a column not found error (PGRST204 or similar), try Attempt 2
    console.warn('First completion attempt failed, trying without completed_at:', error);
  } catch (e) {
    console.warn('Caught error in Attempt 1:', e);
  }

  // Attempt 2: Just status
  const { data, error } = await supabase
    .from('jobs')
    .update({ status: 'completed' })
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    // Attempt 3: Fallback to 'closed' if 'completed' is restricted by DB constraint
    console.warn('Second completion attempt failed, trying with closed status:', error);
    const { data: data3, error: error3 } = await supabase
      .from('jobs')
      .update({ status: 'closed' })
      .eq('id', jobId)
      .select()
      .single();
      
    if (error3) throw error3;
    return data3;
  }
  
  return data;
};

export const fetchDashboardStats = async () => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('You must be logged in.');

  const [jobsRes, appsRes, messagesRes] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .neq('status', 'completed')
      .neq('status', 'closed'),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('freelancer_id', user.id),
    supabase.from('messages')
      .select('chat_id, receiver_id, created_at')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false }),
  ]);

  if (jobsRes.error) throw jobsRes.error;
  if (appsRes.error) throw appsRes.error;
  if (messagesRes.error) throw messagesRes.error;

  // Logic: Count chats where the LATEST message was received by the user
  const latestByChat = new Map<string, { receiver_id: string }>();
  const messages = (messagesRes.data ?? []) as unknown as Array<{ chat_id: string, receiver_id: string }>;
  messages.forEach((msg) => {
    if (!latestByChat.has(msg.chat_id)) {
      latestByChat.set(msg.chat_id, { receiver_id: msg.receiver_id });
    }
  });

  const unreadCount = Array.from(latestByChat.values()).filter(
    (msg) => msg.receiver_id === user.id
  ).length;

  return {
    activeJobs: jobsRes.count ?? 0,
    pendingOffers: appsRes.count ?? 0,
    unreadMessages: unreadCount,
  };
};

export const fetchMarketplaceOverviewStats = async () => {
  const [talentsRes, jobsRes, reviewsRes] = await Promise.all([
    supabase.from('public_profiles').select('*', { count: 'exact', head: true }).ilike('role', 'freelancer'),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('rating'),
  ]);

  if (talentsRes.error) {
    console.error('Talent fetch error:', talentsRes.error);
  }
  if (jobsRes.error) {
    console.error('Jobs fetch error:', jobsRes.error);
  }

  const totalTalents = talentsRes.count ?? 0;
  const totalJobs = jobsRes.count ?? 0;

  const ratings = reviewsRes.data ?? [];
  const averageRating =
    ratings.length > 0 ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / ratings.length : 0;

  return {
    totalTalents,
    totalJobs,
    averageRating,
  };
};
