/**
 * Interface para Departamento que representa a estrutura de um departamento no banco de dados
 * @interface Department
 */
export interface Department {
  name: string;
  responsible: string;
  created_at: Date;
}
