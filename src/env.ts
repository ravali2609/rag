import { z } from "zod";

const ZEnvSchema = z.object({
  PORT: z.string().transform(val => Number(val)),
  // OPENAI_API_KEY: z.string(),
  GEMINI_API_KEY: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().min(1024).max(65535).default(5432),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  API_VERSION: z.string(),
  AWS_S3_ACCESS_KEY_ID: z.string(),
  AWS_S3_SECRET_ACCESS_KEY: z.string(),
  AWS_S3_BUCKET: z.string(),
  AWS_S3_BUCKET_REGION: z.string(),
});

export type Env = z.infer<typeof ZEnvSchema>;

let envData: Env;

try {
  /* eslint-disable node/no-process-env */
  envData = ZEnvSchema.parse(process.env);
}
catch (e) {
  if (e instanceof z.ZodError) {
    console.error("❌ Invalid Env");
    console.error(e.flatten().fieldErrors);
  }
  else {
    console.error(e);
  }
  process.exit(1);
}

export default envData;
