import { BusinessError } from "../errors/BusinessError";
import { User, UserRepository } from "../repositories/UserRepository";
import { UserService } from "../services/UserService";

describe("UserService", () => {
  const user: User = { id: 1, name: "Mario" };

  function createRepository(overrides: Partial<UserRepository> = {}) {
    return {
      findAll: jest.fn<Promise<User[]>, []>().mockResolvedValue([user]),
      findByName: jest.fn<Promise<User | null>, [string]>().mockResolvedValue(null),
      create: jest.fn<Promise<User>, [string]>().mockResolvedValue(user),
      update: jest.fn<Promise<User | null>, [number, string]>().mockResolvedValue(user),
      delete: jest.fn<Promise<boolean>, [number]>().mockResolvedValue(true),
      ...overrides,
    } as unknown as UserRepository;
  }

  it("returns all users", async () => {
    const repository = createRepository();
    const service = new UserService(repository);

    await expect(service.getUsers()).resolves.toEqual([user]);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it("creates a user when the name is available", async () => {
    const repository = createRepository();
    const service = new UserService(repository);

    await expect(service.createUser("Mario")).resolves.toEqual(user);
    expect(repository.findByName).toHaveBeenCalledWith("Mario");
    expect(repository.create).toHaveBeenCalledWith("Mario");
  });

  it("rejects a duplicate user name", async () => {
    const repository = createRepository({
      findByName: jest.fn<Promise<User | null>, [string]>().mockResolvedValue(user),
    });
    const service = new UserService(repository);

    await expect(service.createUser("Mario")).rejects.toEqual(
      new BusinessError("User already exists", 409),
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("updates and deletes a user", async () => {
    const repository = createRepository();
    const service = new UserService(repository);

    await expect(service.updateUser(1, "Luigi")).resolves.toEqual(user);
    await expect(service.deleteUser(1)).resolves.toBe(true);
    expect(repository.update).toHaveBeenCalledWith(1, "Luigi");
    expect(repository.delete).toHaveBeenCalledWith(1);
  });
});
