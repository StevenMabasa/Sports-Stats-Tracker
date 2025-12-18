import supabase from '../../supabaseClient.ts';

export interface TeamRecord {
  id: string;
  name: string;
  coach_id?: string | null;
  coach_name?: string | null;
  logo_url?: string | null;
}

const TEAM_ID_KEY = 'current_team_id';
export const TEAM_LOGO_BUCKET = 'team-logos';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function getCurrentTeamId(): string | null {
  return localStorage.getItem(TEAM_ID_KEY);
}

export function setCurrentTeamId(teamId: string) {
  localStorage.setItem(TEAM_ID_KEY, teamId);
}

export async function fetchTeamById(teamId: string): Promise<TeamRecord | null> {
  console.log('fetchTeamById called with teamId:', teamId);
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .maybeSingle();
  
  console.log('fetchTeamById response - data:', data, 'error:', error);
  
  if (error) {
    console.error('fetchTeamById error', error);
    return null;
  }
  return data as unknown as TeamRecord | null;
}

export async function uploadTeamLogo(teamId: string, file: File): Promise<string | null> {
  const path = `${teamId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(TEAM_LOGO_BUCKET).upload(path, file, { upsert: true });
  if (error) {
    // correctly continue if bucket missing; caller will save team without logo
    console.warn('uploadTeamLogo warning:', error?.message || error);
    return null;
  }
  const { data: publicUrl } = supabase.storage.from(TEAM_LOGO_BUCKET).getPublicUrl(data.path);
  return publicUrl?.publicUrl ?? null;
}

export async function createTeam(teamName: string, logoFile?: File | null, coachId?: string, coachName?: string): Promise<TeamRecord | null> {
  const teamId = slugify(teamName);
  let logoUrl: string | null = null;
  if (logoFile) {
    logoUrl = await uploadTeamLogo(teamId, logoFile);
  }
  const payload: Partial<TeamRecord> = {
    id: teamId,
    name: teamName,
    logo_url: logoUrl,
    coach_id: coachId || null,
    coach_name: coachName || null,
  };
  const { data, error } = await supabase.from('teams').insert(payload).select().single();
  if (error) {
    console.error('createTeam error', error);
    return null;
  }
  setCurrentTeamId(teamId);
  return data as unknown as TeamRecord;
}

export async function fetchTeamByCoachId(coachId: string): Promise<TeamRecord | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('coach_id', coachId)
    .maybeSingle();
  if (error) {
    console.error('fetchTeamByCoachId error', error);
    return null;
  }
  return data as unknown as TeamRecord | null;
}

export async function updateTeam(teamId: string, updates: Partial<TeamRecord>): Promise<boolean> {
  const { error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', teamId);
  
  if (error) {
    console.error('updateTeam error', error);
    return false;
  }
  
  return true;
}


