import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import neo4j, { Driver, Session } from 'neo4j-driver';
import { toNativeTypes } from './utils.js';
import { int } from 'neo4j-driver'

dotenv.config();

const app: Express = express();
const port = process.env.PORT || '8000';
const neoUri = process.env.NEO_URI || '';
const neoUsername = process.env.NEO_USERNAME || '';
const neoPassword = process.env.NEO_PASSWORD || '';
const occupation = 'Desarrollador Backend Javascript';
const occupationId = 3322;

const getSkillsByOccupationId = async () => {
  const driver: Driver = neo4j.driver(neoUri, neo4j.auth.basic(neoUsername, neoPassword));

  const session: Session = driver.session();
 try {
    const result = await session.run(
      `
        MATCH (occ:occupation)-[r:occupation_skill_mandatory]->(n2)
        WHERE ID(occ) = $occupationId
        RETURN occ, r, n2
      `, { occupationId: int(occupationId) }
    )


    const mandatorySkills = result.records.map(row => toNativeTypes(row.get('r')));
    console.log(mandatorySkills)
    return mandatorySkills

  } finally {
    await session.close()
  }


}


app.get('/', async (req: Request, res: Response) => {
  const skills = await getSkillsByOccupationId();

  res.send(skills);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
