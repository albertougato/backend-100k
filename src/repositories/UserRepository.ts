import { db } from "../config/database";

export interface User {
  id: number;
  name: string;
}

export class UserRepository {
  async findAll(): Promise<User[]> {
    const result = await db.query(
      `
        SELECT
          id,
          name
        FROM users
        ORDER BY id
      `,
    );

    return result.rows;
  }

  async findByName(name: string): Promise<User | null> {
    const result = await db.query(
      `
        SELECT
          id,
          name
        FROM users
        WHERE name = $1
      `,
      [name],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

   async create(name: string): Promise<User> {
    const result = await db.query(
      `
        INSERT INTO users(name)
        VALUES ($1)
        RETURNING id, name
      `,
      [name],
    );

    return result.rows[0];
  }
}