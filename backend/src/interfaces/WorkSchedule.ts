/**
 * Interface WorkSchedule que representa a estrutura de um horário de trabalho no banco de dados
 */
export interface WorkSchedule {
  name: string;
  start_time: string;
  end_time: string;
  lunch_duration: string;
  created_at: string;
}
