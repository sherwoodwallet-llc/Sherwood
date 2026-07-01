export type ProfileRole = "master" | "outreach_manager";

export type OutreachStatus =
  | "pending_review"
  | "needs_edit"
  | "approved"
  | "sent"
  | "rejected"
  | "failed";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: ProfileRole;
  manager_number: number | null;
  active: boolean;
};

export type OutreachTask = {
  id: string;
  batch_id: string | null;
  organization_name: string;
  organization_type: string | null;
  organization_website: string | null;
  fit_reason: string | null;
  contact_name: string | null;
  contact_email: string;
  draft_email: string;
  draft_subject: string | null;
  assigned_to: string | null;
  assigned_manager_number: number | null;
  status: OutreachStatus;
  manager_notes: string | null;
  sent_at: string | null;
  sent_by: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "id" | "email" | "full_name" | "manager_number"> | null;
};
