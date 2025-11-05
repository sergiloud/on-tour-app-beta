import { DataSource } from "typeorm";
import { Show } from "./entities/Show.js";
import { FinanceRecord } from "./entities/FinanceRecord.js";
import { Itinerary } from "./entities/Itinerary.js";
import { Settlement } from "./entities/Settlement.js";
import { Organization } from "./entities/Organization.js";
import { CreateShowsTable } from "./migrations/1704067200000-CreateShowsTable.js";
import { CreateFinanceTable } from "./migrations/1704067200001-CreateFinanceTable.js";
import { CreateItinerariesTable } from "./migrations/1704067200002-CreateItinerariesTable.js";
import { CreateSettlementsTable } from "./migrations/1704067200003-CreateSettlementsTable.js";
import { CreateOrganizationsTable1699209600000 } from "./migrations/1704067200004-CreateOrganizationsTable.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "on_tour_app",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [Organization, Show, FinanceRecord, Itinerary, Settlement],
  migrations: [
    CreateShowsTable,
    CreateFinanceTable,
    CreateItinerariesTable,
    CreateSettlementsTable,
    CreateOrganizationsTable1699209600000,
  ],
  subscribers: [],
  dropSchema: false,
});
