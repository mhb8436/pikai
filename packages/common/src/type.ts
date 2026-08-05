import { personalColorEnum } from "./enum";

export interface jwtPayloadType {
  id: number;
  email: string;
  isAdmin: boolean;
  tone: personalColorEnum;
}
