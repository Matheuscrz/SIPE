/**
 * Interface Role representa a estrutura de dados para uma função (ou cargo) em um departamento.
 */
export interface Role {
  id: string; // Identificador único da função.
  name: string; // Nome da função.
  department_id: string; // Identificador do departamento ao qual a função pertence.
  created_at: Date; // Data de criação da função.
}
