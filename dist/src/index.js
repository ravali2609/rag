import { serve } from "@hono/node-server";
import app from "./app.js";
import envData from "./env.js";
import { storeDocument } from "./services/ragServices.js";
const port = envData.PORT;
serve({
    fetch: app.fetch,
    port,
}, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on http://localhost:${port}/${envData.API_VERSION}`);
});
async function main() {
    try {
        console.log('DB connected via Drizzle!');
        const title = 'Test Document';
        const content = `
    This is a test document.
    It contains some text.`;
        const docId = await storeDocument(title, content);
        console.log('Document stored successfully with ID:', docId);
        process.exit(0);
    }
    catch (err) {
        console.error('Error storing document:', err);
        process.exit(1);
    }
}
main();
