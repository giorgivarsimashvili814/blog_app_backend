import { UserRole } from "./userRole";

export default interface JwtPayload {
  userId: number;
  role: UserRole;
  iat: number;
  exp: number;
}
