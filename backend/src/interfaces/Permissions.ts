/**
 * @interface Permission
 * @description Interface para permissões de usuário
 */
export interface Permission {
  name: string;
  can_manage_users: boolean;
  can_manage_departments: boolean;
  can_manage_work_schedules: boolean;
  can_manage_roles: boolean;
  can_manage_permissions: boolean;
  can_approve_absences: boolean;
  can_generate_reports: boolean;
  can_view_all_time_records: boolean;
  can_manage_device: boolean;
  can_manage_company: boolean;
  created_at: Date;
}
