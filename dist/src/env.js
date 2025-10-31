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
});
let envData;
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
