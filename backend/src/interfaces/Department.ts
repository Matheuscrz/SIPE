/**
 * @interface Department
 * @description Interface para Departamento que representa a estrutura de um departamento no banco de dados
 */
export interface Department {
  name: string;
  responsible: string;
  created_at: Date;
}
