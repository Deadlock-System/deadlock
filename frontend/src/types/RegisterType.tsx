export type Seniority = "STUDENDT" | "JUNIOR" | "PLENO" | "SENIOR" | "TECH_LEAD" | "C_LEVEL";

export type SeniorityId = Seniority | "NOT_SELECTED";

export type SelectOption<TValue extends string> = {
  value: TValue;
  label: string;
};

export const SENIORITY_LABELS = {
  NOT_SELECTED: "Não selecionado",
  STUDENDT: "Estudante",
  JUNIOR: "Junior",
  PLENO: "Pleno",
  SENIOR: "Senior",
  TECH_LEAD: "Tech Lead",
  C_LEVEL: "C-Level",
} as const satisfies Record<SeniorityId, string>;

export const SENIORITY_ORDER = [
  "NOT_SELECTED",
  "STUDENDT",
  "JUNIOR",
  "PLENO",
  "SENIOR",
  "TECH_LEAD",
  "C_LEVEL",
] as const satisfies ReadonlyArray<SeniorityId>;

export const SENIORITY_OPTIONS: SelectOption<SeniorityId>[] = SENIORITY_ORDER.map(
  (seniorityId) => ({
    value: seniorityId,
    label: SENIORITY_LABELS[seniorityId],
  })
);

export interface RegisterType {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  seniorityId: Seniority;
}
