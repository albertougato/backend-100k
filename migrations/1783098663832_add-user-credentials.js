exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("users", {
    email: { type: "text" },
    password_hash: { type: "text" },
  });
  pgm.addConstraint("users", "users_email_unique", {
    unique: "email",
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("users", "users_email_unique");
  pgm.dropColumns("users", ["email", "password_hash"]);
};
