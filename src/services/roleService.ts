import supabase from '../../supabaseClient';

export interface UserRole {
  id: string;
  email: string;
  role: 'Fan' | 'Coach' | 'Admin';
  google_id?: string;
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, google_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data as UserRole;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
}

export async function updateUserRole(userId: string, role: 'Fan' | 'Coach' | 'Admin'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return false;
  }
}

export async function isCoach(userId: string): Promise<boolean> {
  const userRole = await getUserRole(userId);
  return userRole?.role === 'Coach';
}

export async function isFan(userId: string): Promise<boolean> {
  const userRole = await getUserRole(userId);
  return userRole?.role === 'Fan';
}

export async function createUserProfile(userId: string, email: string, role: 'Fan' | 'Coach' | 'Admin' = 'Fan'): Promise<boolean> {
  try {
    // Insert into users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        role
      });

    if (userError) {
      console.error('Error creating user:', userError);
      return false;
    }

    // Insert into user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        display_name: email.split('@')[0] // Use email prefix as display name
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return false;
  }
}
