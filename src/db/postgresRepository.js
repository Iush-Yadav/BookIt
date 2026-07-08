/*
 * PostgreSQL is the production target for BookIt. The checked-in Prisma schema
 * captures the relational model, indexes, ownership boundaries, and conflict
 * entities. The memory store powers local demo/test runs when PostgreSQL is not
 * provisioned; production deployments should implement this repository against
 * Prisma transactions and set DATA_STORE=postgres.
 */

function createPostgresRepository() {
  throw new Error("PostgreSQL repository is documented in prisma/schema.prisma but not enabled in this local demo runtime. Use DATA_STORE=memory for local runs.");
}

module.exports = { createPostgresRepository };
