import envData from "../env.js";
export const appConfig = {
    port: Number(envData.PORT),
};
export const dbConfig = {
    DB_HOST: envData.DB_HOST,
    DB_PORT: envData.DB_PORT,
    DB_USER: envData.DB_USER,
    DB_PASSWORD: envData.DB_PASSWORD,
    DB_NAME: envData.DB_NAME,
};
export const aiConfig = {
    geminiKey: envData.GEMINI_API_KEY
};
