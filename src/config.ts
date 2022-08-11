import { existsSync } from "fs";
import { join } from "path";

interface IServerConfig {
  port: number;
}

interface IBotConfig {
  token: string;
  prefix: string;
  channel: string;
  checkInterval: number;
  pingRole?: string;
  timezone?: string;
}

interface IGoogleConfig {
  clientId: string;
  clientSecret: string;
  authURI: string;
  tokenURI: string;
  redirectURI: string;
  scopes: string[];
  enrollmentCodes?: string[];
  linkIDs?: string[];
}

export interface IConfig {
  server: IServerConfig;
  bot: IBotConfig;
  google: IGoogleConfig;
}

let config: IConfig;

const envPath = join(__dirname, "..", ".env");

if (existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
} else {
  if (process.env.NODE_ENV !== "production")
    throw new Error("No .env file found");
}

let env = process.env;

config = {
  server: {
    port: env.PORT ? parseInt(env.PORT) : 3000,
  },
  bot: {
    token: env.BOT_TOKEN as string,
    prefix: env.BOT_PREFIX as string,
    channel: env.BOT_ANNOUNCEMENT_CHANNEL as string,
    checkInterval: env.BOT_CHECK_INTERVAL
      ? parseInt(env.BOT_CHECK_INTERVAL)
      : 60,
    pingRole: env.BOT_PING_ROLE,
    timezone: env.TIMEZONE,
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID as string,
    clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    authURI: env.GOOGLE_AUTH_URI as string,
    tokenURI: env.GOOGLE_TOKEN_URI as string,
    redirectURI: env.GOOGLE_REDIRECT_URI as string,
    scopes: env.GOOGLE_SCOPES ? env.GOOGLE_SCOPES.split(",") : [],
    linkIDs: env.GOOGLE_LINK_IDS ? env.GOOGLE_LINK_IDS.split(",") : [],
  },
};

export default config;
