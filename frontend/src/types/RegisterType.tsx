export type Seniority = 'STUDENDT' | 'JUNIOR' | 'PLENO' | 'SENIOR' | 'TECH_LEAD' | 'C_LEVEL';

export interface RegisterType {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  seniorityId: Seniority;
}