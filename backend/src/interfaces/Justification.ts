/**
 * @interface Justification
 * @description Interface para Justificativa que representa a estrutura de uma justificativa no banco de dados
 */
export interface Justification {
  id: string;
  userId: string;
  justification: string;
  justification_date: Date;
  created_at: string;
}
