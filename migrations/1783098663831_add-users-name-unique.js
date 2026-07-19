exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint("users", "users_name_unique", {
    unique: "name",
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("users", "users_name_unique");
};
