import { ILoginRequest } from "./auth-model";

export interface IRequestUser {
  name: string;
  email: string;
  gender: string;
  birthdate: Date;
}

export interface IUserObject extends ILoginRequest, Pick<IRequestUser, "name" | "gender" | "birthdate"> {
  id: number;
  photo?: string | null;
  active: string;
  created_by?: number | null;
  created_at: Date;
  updated_by?: number | null;
  updated_at: Date;
}
