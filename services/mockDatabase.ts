import { supabase } from '../lib/supabase';
import { Profile, Task, TaskStatus, Transaction, UserRole, Bid, JOB_CATEGORIES } from '../types';

// --- REAL DATABASE SERVICE ---
// Note: Ensure you have run the SUPABASE_SETUP.sql in your Supabase SQL Editor.

export const authService = {
  // Login with Supabase Auth
  login: async (email: string, password?: string): Promise<Profile> => {
    if (!password) throw new Error("Password is required");

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("No user found");

    // Fetch Profile from DB
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
        // Handle case where profile might be missing (should be handled by DB trigger, but safe fallback)
        if (profileError.code === 'PGRST116') {
            console.warn("Profile missing, creating default profile.");
            const newProfile: Profile = {
                id: authData.user.id,
                email: email,
                role: UserRole.WRITER,
                is_active: false,
                wallet_balance_cents: 0
            };
            await supabase.from('profiles').insert([newProfile]);
            return newProfile;
        }
        throw profileError;
    }

    return profile as Profile;
  },

  // Register with Supabase Auth
  register: async (email: string, password?: string, phone?: string): Promise<Profile> => {
    if (!password) throw new Error("Password is required");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { phone_number: phone, role: UserRole.WRITER }
      }
    });

    if (authError) throw authError;
    
    // Check if session exists (Auto-confirm might be off)
    if (!authData.user) throw new Error("Registration initiated. Please check your email.");

    // The 'handle_new_user' trigger in SQL should create the profile. 
    // We return a temporary object for UI feedback, or fetch the new profile.
    
    // Small delay to allow trigger to run
    await new Promise(r => setTimeout(r, 1000));

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profile) return profile as Profile;

    return {
        id: authData.user.id,
        email: email,
        phone_number: phone,
        role: UserRole.WRITER,
        is_active: false,
        wallet_balance_cents: 0
    } as Profile;
  },
  
  logout: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async (): Promise<Profile | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
        const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
        if (error) return null;
        return profile as Profile | null;
    }

    return null;
  }
};

export const paymentService = {
  // Simulate STK Push (Real one requires backend Edge Function)
  initiateSTKPush: async (phoneNumber: string, amount: number): Promise<{ success: boolean, message: string }> => {
    // In a production app, this would call: await supabase.functions.invoke('mpesa-stk-push', { body: { phoneNumber, amount } })
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    if (phoneNumber.length < 10) return { success: false, message: 'Invalid phone number' };
    return { success: true, message: 'STK Push sent. Check your phone.' };
  },

  confirmPayment: async (user: Profile): Promise<Profile> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 1. Update Profile to Active
    const { data: updatedUser, error: updateError } = await supabase
        .from('profiles')
        .update({ 
            is_active: true,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

    if (updateError) throw updateError;

    // 2. Record Transaction
    const transaction: Partial<Transaction> = {
        user_id: user.id,
        type: 'activation_fee',
        amount_cents: 50000,
        mpesa_reference: 'SB' + Math.random().toString(36).substring(7).toUpperCase(),
        status: 'complete',
        date: new Date().toISOString()
    };
    await supabase.from('transactions').insert([transaction]);

    return updatedUser as Profile;
  }
};

export const taskService = {
  // Fetch tasks from Real DB
  getTasks: async (): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
    return data as Task[];
  },

  // Helper for Admin to populate DB
  seedTasks: async (): Promise<{success: boolean, message: string}> => {
    // Keep this logic but insert into real DB
    const SAMPLE_TASKS = [
        { title: "5 Blog Posts on Fintech Trends", category: "Content Writing", price_cents: 250000, description: "Write 5 engaging blog posts about mobile money.", deadline: "" },
        { title: "Legal Deposition Audio to Text", category: "Transcription", price_cents: 200000, description: "Verbatim transcription of a legal deposition. 1 hour audio.", deadline: "" },
        { title: "Logo Design for Organic Juice", category: "Graphic Design", price_cents: 500000, description: "Create a modern logo for 'GreenGlow Juices'.", deadline: "" },
        { title: "Data Entry: Real Estate", category: "Data Entry", price_cents: 150000, description: "Verify and update 200 property listings.", deadline: "" },
        { title: "Translate Contract (Eng-Swa)", category: "Translation", price_cents: 350000, description: "Translate a 10-page rental agreement.", deadline: "" },
    ];

    try {
        const now = new Date();
        const promises = SAMPLE_TASKS.map(task => {
            const deadline = new Date(now);
            deadline.setHours(deadline.getHours() + 48 + Math.floor(Math.random() * 72));
            
            return supabase.from('tasks').insert([{
                ...task,
                status: TaskStatus.OPEN,
                created_at: new Date().toISOString(),
                deadline: deadline.toISOString()
            }]);
        });

        await Promise.all(promises);
        return { success: true, message: "Real database seeded with sample tasks." };

    } catch (e: any) {
        return { success: false, message: e.message };
    }
  },

  placeBid: async (taskId: string, userId: string, proposal: string): Promise<{ success: boolean, message: string }> => {
      // Insert into Real DB
      const { error } = await supabase.from('bids').insert([{
          task_id: taskId,
          user_id: userId,
          proposal: proposal,
          amount_cents: 0,
          status: 'pending'
      }]);

      if (error) {
          // Check for unique constraint if we had one, or just general error
          return { success: false, message: "Failed to submit application: " + error.message };
      }
      return { success: true, message: "Application submitted successfully!" };
  },

  // Fetch all bids for currently loaded tasks (Optimized for dashboard view)
  getAllBids: async (): Promise<Bid[]> => {
      const { data, error } = await supabase.from('bids').select('*');
      if (error) return [];
      return data as Bid[];
  },

  getUserBids: async (userId: string): Promise<Bid[]> => {
      const { data, error } = await supabase.from('bids').select('*').eq('user_id', userId);
      if (error) return [];
      return data as Bid[];
  },
  
  // For Admin view
  getBidsByTask: async (taskId: string): Promise<Bid[]> => {
      const { data, error } = await supabase.from('bids').select('*').eq('task_id', taskId);
      if (error) return [];
      return data as Bid[];
  },

  assignTask: async (taskId: string, userId: string): Promise<{ success: boolean, message: string }> => {
    const { error } = await supabase
        .from('tasks')
        .update({ 
            status: TaskStatus.ASSIGNED, 
            assigned_to: userId 
        })
        .eq('id', taskId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Task assigned successfully!' };
  },

  submitTask: async (taskId: string, notes: string, file: File): Promise<{ success: boolean, message: string }> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${taskId}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to real storage bucket
        const { error: uploadError } = await supabase.storage
            .from('assignments')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('assignments')
            .getPublicUrl(filePath);

        const { error: updateError } = await supabase
            .from('tasks')
            .update({
                status: TaskStatus.REVIEW,
                submission_notes: notes,
                submission_url: data.publicUrl
            })
            .eq('id', taskId);

        if (updateError) throw updateError;

        return { success: true, message: 'Task submitted for review.' };

    } catch (error: any) {
        console.error("Submission error:", error);
        return { success: false, message: 'Submission failed: ' + error.message };
    }
  },

  createTask: async (task: Omit<Task, 'id' | 'created_at' | 'status'>): Promise<Task> => {
    const { data, error } = await supabase
        .from('tasks')
        .insert([{
            ...task,
            status: TaskStatus.OPEN,
            created_at: new Date().toISOString()
        }])
        .select()
        .single();
    
    if (error) throw error;
    return data as Task;
  },

  getMyJobs: async (userId: string): Promise<Task[]> => {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', userId)
        .order('deadline', { ascending: true });

    if (error) return [];
    return data as Task[];
  },

  getReviews: async (): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', TaskStatus.REVIEW)
      .order('created_at', { ascending: true });
    
    if (error) return [];
    return data as Task[];
  },

  processReview: async (taskId: string, approved: boolean): Promise<boolean> => {
    const newStatus = approved ? TaskStatus.COMPLETED : TaskStatus.ASSIGNED; 
    const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

    return !error;
  }
};

export const walletService = {
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
    if (error) return [];
    return data as Transaction[];
  }
};