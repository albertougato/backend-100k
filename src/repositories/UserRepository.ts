import { db } from "../config/database";

export interface User {
  id: number;
  name: string;
}

export interface UserCredentials extends User {
  email: string;
  passwordHash: string;
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

  async findByEmail(email: string): Promise<UserCredentials | null> {
    const result = await db.query(
      `
      SELECT
        id,
        name,
        email,
        password_hash AS "passwordHash"
      FROM users
      WHERE email = $1
      `,
      [email],
    );

    return result.rows[0] ?? null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await db.query(
      `
      SELECT
        id,
        name
      FROM users
      WHERE id = $1
      `,
      [id],
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

  async createWithCredentials(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<User> {
    const result = await db.query(
      `
      INSERT INTO users(name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name
      `,
      [name, email, passwordHash],
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
