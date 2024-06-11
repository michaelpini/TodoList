import express from 'express';
import bodyParser from 'body-parser';
import { apiRoutes } from './routes/routes.js';

const app = express();

app.use(express.static('source/public'));  // Serve frontend
app.use(bodyParser.json());  // tries to extract json and attach it as req.body
app.use('/', apiRoutes);   // use apiRoutes to select correct api
app.use((err,req,res,next) => {
    res.status(500).send('Error occurred');
});

export { app };
