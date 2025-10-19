/**
 * Convert Prisma objects to plain JavaScript objects
 * This fixes the Pinia serialization issue where obj.hasOwnProperty is not a function
 * @param data - Prisma query result
 * @returns Plain JavaScript object
 */
export function serializePrisma<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}
