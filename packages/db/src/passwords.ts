import bcrypt from "bcryptjs";

const ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  if (password.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres");
  return bcrypt.hash(password, ROUNDS);
}

let dummyHash: Promise<string> | undefined;

/**
 * Sin hash (el usuario no existe) se compara igual contra un hash de relleno,
 * para que el tiempo de respuesta no revele qué emails están registrados.
 */
export async function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) {
    dummyHash ??= bcrypt.hash("relleno-para-tiempo-constante", ROUNDS);
    await bcrypt.compare(password, await dummyHash);
    return false;
  }
  return bcrypt.compare(password, hash);
}
