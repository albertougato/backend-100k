"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = require("../config/database");
class UserRepository {
    async findAll() {
        const result = await database_1.db.query(`
        SELECT
          id,
          name
        FROM users
        ORDER BY id
      `);
        return result.rows;
    }
    async findByName(name) {
        const result = await database_1.db.query(`
        SELECT
          id,
          name
        FROM users
        WHERE name = $1
      `, [name]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    async create(name) {
        const result = await database_1.db.query(`
        INSERT INTO users(name)
        VALUES ($1)
        RETURNING id, name
      `, [name]);
        return result.rows[0];
    }
}
exports.UserRepository = UserRepository;
