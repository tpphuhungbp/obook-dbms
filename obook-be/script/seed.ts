import { Client, Pool } from "pg";

async function start() {
  const client = new Client({
    connectionString: `postgres://postgres:thang034869@localhost:5432/obook`,
  });

  await client.connect();

  // console.log(await client.query(`drop schema obook;`));
  await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            user_id VARCHAR(255) PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            avatar VARCHAR(255) NOT NULL,
            sex VARCHAR(255) NOT NULL,
            dob VARCHAR(255) NOT NULL,
            refreshToken VARCHAR(255) NOT NULL
        );`);

  await client.query(`
        CREATE TABLE IF NOT EXISTS posts (
            post_id VARCHAR(255) PRIMARY KEY,
            description VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) REFERENCES users(user_id) NOT NULL
        );`);

  await client.query(`
        CREATE TABLE IF NOT EXISTS photos (
            photo_id VARCHAR(255) PRIMARY KEY,
            status VARCHAR(255) NOT NULL,
            source VARCHAR(255) NOT NULL
        );`);

  await client.query(`
  CREATE TABLE follows (
    follower_id VARCHAR(255) REFERENCES users(user_id) NOT NULL,
    following_id VARCHAR(255) REFERENCES users(user_id) NOT NULL,
    PRIMARY KEY (follower_id, following_id)
  );`);

  await client.query(`
  CREATE TABLE likes (
    user_id VARCHAR(255) REFERENCES users(user_id) NOT NULL,
    post_id VARCHAR(255) REFERENCES posts(post_id) NOT NULL,
    PRIMARY KEY (user_id, post_id)
  );`);

  await client.query(`
  CREATE TABLE post_has_photos (
    post_id VARCHAR(255) REFERENCES posts(post_id) NOT NULL,
    photo_id VARCHAR(255) REFERENCES photos(photo_id) NOT NULL,
    PRIMARY KEY (post_id, photo_id)
  );`);

  await client.end();
}

if (require.main === module) {
  start()
    .then(() => {
      console.log("Database table create completed");
      process.exit();
    })
    .catch((error) => {
      console.error("Creating fails", error);
      process.exit();
    });
}
