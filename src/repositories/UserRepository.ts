export interface User {
  id: number;
  name: string;
}

export class UserRepository {
  private users: User[] = [
    {
      id: 1,
      name: "Mario",
    },
  ];

  async findAll(): Promise<User[]> {
    return this.users;
  }
}