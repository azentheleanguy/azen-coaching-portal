export interface CheckIn {
  date: string;
  weight?: string;
  waist?: string;
  chest?: string;
  rightArm?: string;
  leftArm?: string;
  rightThigh?: string;
  leftThigh?: string;
  hips?: string;
  daysCompleted?: string;
  planDays?: string;
  sleepHours?: string;
  dietAdherence?: string;
  waterLiters?: string;
  steps?: string;
  supplements?: string;
  supplementsDetail?: string;
  energy?: number;
  motivation?: number;
  stress?: number;
  cravings?: number;
  wins?: string;
  challenges?: string;
  questions?: string;
}

export interface CoachNote {
  text: string;
  date: string;
}

export interface ClientData {
  name: string;
  joined: string;
  checkins: CheckIn[];
  notes: CoachNote[];
}
