import express from 'express';
import { promises as fs } from 'fs';
import querystring from 'querystring';

const router = express.Router();

router.get('/', async (_, res) => {
  const data = JSON.parse(await fs.readFile(`./${global.fileName}`));
  res.send(data);
});

router.post('/', async (req, res) => {
  // prettier-ignore

  const { student, subject, type, value } = req.body;
  const data = JSON.parse(await fs.readFile(`./${global.fileName}`, 'utf8'));
  const grade = {
    id: data.nextId++,
    student,
    subject,
    type,
    value,
    timestamp: new Date(),
  };
  data.grades.push(grade);
  await fs.writeFile(`./${global.fileName}`, JSON.stringify(data));
  res.send(data);
});

router.put('/', async (req, res) => {
  try {
    const { id, student, subject, type, value } = req.body;

    if (!id || !student || !subject || !type || !value) {
      throw new Error('Todos os campos são obrigatórios');
    }

    const data = JSON.parse(await fs.readFile(`./${global.fileName}`));
    const index = data.grades.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error('Grade não existe!');
    }

    data.grades[index].student = student;
    data.grades[index].subject = subject;
    data.grades[index].type = type;
    data.grades[index].value = value;

    await fs.writeFile(`./${global.fileName}`, JSON.stringify(data));

    res.send(data.grades[index]);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (!id) {
      throw new Error('Id obrigatório');
    }

    const data = JSON.parse(await fs.readFile(`./${global.fileName}`));
    const grade = data.grades.find((item) => item.id === id);
    if (!grade) {
      throw new Error('Grade não existe');
    }

    data.grades = data.grades.filter((item) => item.id !== id);
    await fs.writeFile(`./${global.fileName}`, JSON.stringify(data));

    res.sendStatus(204);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = JSON.parse(await fs.readFile(`./${global.fileName}`));
    const grade = data.grades.find((item) => item.id === id);
    if (!grade) {
      throw new Error('Grade não localizada');
    }

    res.send(grade);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/best/subject/:subject/type/:type', async (req, res) => {
  const { subject, type } = req.params;

  try {
    if (!subject || !type) {
      throw new Error('Subject e type são obrigatórios!');
    }

    const data = JSON.parse(await fs.readFile(`./${global.fileName}`));
    const grades = data.grades
      .filter((item) => item.subject === subject && item.type === type)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
    res.send(grades);
  } catch (error) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/sum/student/:student/subject/:subject', async (req, res) => {
  const { student, subject } = req.params;

  try {
    if (!student || !subject) {
      throw new Error('Student e subject são obrigatórios');
    }
    const data = JSON.parse(await fs.readFile(`./${global.fileName}`));
    const grades = data.grades
      .filter((item) => item.student === student && item.subject === subject)
      .map((item) => {
        return {
          student: item.student,
          subject: item.subject,
          value: item.value,
        };
      });

    if (!grades.length) {
      throw new Error(
        'Nenhum resultado encontrado para os parâmetros especificados.'
      );
    }

    const total = grades.reduce((prev, curr) => {
      return prev + curr.value;
    }, 0);

    const grade = {
      student: grades[0].student,
      subject: grades[0].subject,
      total,
    };

    res.send(grade);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/average/subject/:subject/type/:type', async (req, res) => {
  try {
    const { subject, type } = req.params;
    if (!subject || !type) {
      throw new Error('Subject e type são obrigatórios!');
    }

    const json = JSON.parse(await fs.readFile(`./${global.fileName}`));

    const grades = json.grades.filter(
      (grade) =>
        grade.subject === req.params.subject && grade.type === req.params.type
    );

    if (!grades.length) {
      throw new Error(
        'Não foram encontrados registros para os parâmetros informados'
      );
    }

    const total = grades.reduce((prev, curr) => {
      return prev + curr.value;
    }, 0);

    res.send({ average: total / grades.length });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

export default router;
