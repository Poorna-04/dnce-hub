export interface StudentProfile {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  danceInterests: string[];
  bio: string | null;
}
