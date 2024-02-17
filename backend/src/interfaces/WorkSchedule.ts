/**
 * Interface WorkSchedule representa a estrutura de dados para uma jornada de trabalho.
 */
export interface WorkSchedule {
  id: string; // Identificador único da jornada de trabalho.
  name: string; // Nome da jornada de trabalho.
  start_time: string; // Hora de início da jornada.
  end_time: string; // Hora de término da jornada.
  lunch_start_time: string | null; // Hora de início do intervalo de almoço (pode ser nulo).
  lunch_end_time: string | null; // Hora de término do intervalo de almoço (pode ser nulo).
  created_at: Date; // Data de criação do registro da jornada de trabalho.
}
