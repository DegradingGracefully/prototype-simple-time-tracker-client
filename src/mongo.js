/*  Thanks book Svelte and Sapper in Action, Appendix C about Mongo
 */
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017";

// These are recommended MongoDB options to avoid deprecation warnings.
const options = { useNewUrlParser: true, useUnifiedTopology: true };

// All uses of the "await" keyword must be in an "async" function.
async function logCollection(coll) {
  let result = await coll.find().toArray();
  console.log(coll.collectionName, "contains", result);
}

async function logCollections(db) {
  const items = await db.listCollections().toArray();
  console.log(
    "collections are",
    items.map((item) => item.name)
  );
}

async function logDatabases(client) {
  const dbs = await client.db().admin().listDatabases();
  console.log(
    "databases are",
    dbs.databases.map((db) => db.name)
  );
}

export async function launchDB() {
  let client;
  try {
    client = await MongoClient.connect(url, options);
    await logDatabases(client);

    // Use the "timemore" database.
    const db = client.db("timemore");
  } catch (e) {
    console.error(e);
  } finally {
    if (client) client.close();
  }
}
