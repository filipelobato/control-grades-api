import express from 'express';
import { promises as fs } from 'fs';
import gradesRouter from './../routes/grades.js';

const app = express();
global.fileName = 'grades.json';

app.use(express.json());

app.use('/grades', gradesRouter);

app.listen(3000, () => {
  console.log('API Started...');
});
