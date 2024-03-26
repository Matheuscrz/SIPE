/**
 * @interface TimeRecord
 * @description Interface para Registro de Ponto que representa a estrutura de um registro de ponto no banco de dados
 */
export interface TimeRecord {
  id: string;
  userId: string;
  record: string;
  location: string;
  created_at: string;
}
