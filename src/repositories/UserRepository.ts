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

    return result.rows[0] ?? null;
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

  async delete(id: number): Promise<boolean> {
    const result = await db.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
      `,
      [id],
    );

    return result.rowCount === 1;
  }

  async update(id: number, name: string): Promise<User | null> {
    const result = await db.query(
      `
      UPDATE users
      SET name = $2
      WHERE id = $1
      RETURNING id, name
      `,
      [id, name],
    );

    return result.rows[0] ?? null;
  }
}