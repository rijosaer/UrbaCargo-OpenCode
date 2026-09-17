export type UserType = "Particular" | "Empresa";

export interface AppUser {
  type: UserType;
  name: string;
  email: string;
  location: string;
}

export interface LoginUser extends AppUser {
  password: string;
}

export const users: LoginUser[] = [
  {
    type: "Particular",
    name: "María Pérez",
    email: "cliente@test.com",
    password: "123456",
    location: "Barrio Centro, Concepción",
  },
  {
    type: "Empresa",
    name: "Logística Andina SPA",
    email: "empresa@test.com",
    password: "123456",
    location: "Parque Industrial, Concepción",
  },
];

export const findUser = (email: string, password: string) =>
  users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
