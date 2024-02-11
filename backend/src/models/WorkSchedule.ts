/**
 * Interface WorkSchedule representa a estrutura de dados para um horário de trabalho.
 */
export interface WorkSchedule {
  id: string; // Identificador único do horário de trabalho.
  name: string; // Nome do horário de trabalho.
  start_time: Date; // Horário de início do expediente.
  end_time: Date; // Horário de término do expediente.
  lunch_start_time?: Date; // Horário de início do intervalo de almoço (opcional).
  lunch_end_time?: Date; // Horário de término do intervalo de almoço (opcional).
  created_at: Date; // Data de criação do horário de trabalho.
}
