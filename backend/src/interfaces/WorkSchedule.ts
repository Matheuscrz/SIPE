/**
 * @interface WorkSchedule
 * @description Interface para Escala de Trabalho que representa a estrutura de uma escala de trabalho no banco de dados
 */
export interface WorkSchedule {
  name: string;
  start_time: string;
  end_time: string;
  lunch_duration: string;
  created_at: string;
}
