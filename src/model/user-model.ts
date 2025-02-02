import { ILoginRequest } from "./auth-model";

export interface IUserObject extends ILoginRequest {
  id: number;
  name: string;
  gender: string;
  birthdate: Date;
  photo?: string | null;
  active: string;
  created_by?: number | null;
  created_at: Date;
  updated_by?: number | null;
  updated_at: Date;
}
