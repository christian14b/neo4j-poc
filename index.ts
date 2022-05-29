import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import neo4j, { Driver, Session } from 'neo4j-driver';
import { toNativeTypes } from './utils.js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || '8000';
const neoUri = process.env.NEO_URI || '';
const neoUsername = process.env.NEO_USERNAME || '';
const neoPassword = process.env.NEO_PASSWORD || '';
const driver: Driver = neo4j.driver(neoUri, neo4j.auth.basic(neoUsername, neoPassword));
const session: Session = driver.session();

try {
  const result = await session.run(
    `
    MATCH (tom:Person {name: "Tom Hanks"})-[:ACTED_IN]->(tomHanksMovies)
    RETURN tom,tomHanksMovies
    `,
  )

  const movies = result.records.map(row => toNativeTypes(row.get('tomHanksMovies')))

  console.log(movies);

} finally {
  await session.close()
}

// on application exit:
await driver.close()

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
