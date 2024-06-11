import { app } from "./source/express/app.js";

const host = "localhost";
const port = 3000;
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Todo app listening at http://${host}:${port}`);
});
