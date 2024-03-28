import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
/* import pool from './src/config/postgre.js';
import db from './src/config/mongo.js'; )*/

const app = express();
const aWss = expressWs(app);

app.use(express.json());

const router = express.Router();
const mockUsers = [];
let clients = [];

const mockPremios = [
  { uuid: 123321, name: 'TV' },
  { uuid: 123231, name: 'Carro' },
  { uuid: 123123, name: 'Moto' },
  { uuid: 123213, name: 'Bicicleta' },
];
router.post('/login', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nome não fornecido' });
    }

    /* const sqlReturn = await pool.query(
      'INSERT INTO participantes (name) VALUES ($1)',
      [name]
    ); */
    const userUuid = Math.floor(Math.random() * 10000);
    mockUsers.push({ uuid: userUuid, name });

    broadcastParticipants();
    res.status(200).json({ uuid: userUuid });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { uuid } = req.body;
    if (!uuid) {
      return res.status(400).json({ error: 'uuid não fornecido' });
    }
    const user = mockUsers.find((user) => user.uuid !== uuid);

    mockUsers.splice(mockUsers.indexOf(user), 1);
    /*     await pool.query(
      'UPDATE participantes SET logout = NOW() WHERE name = $1',
      [name]
    ); */
    broadcastParticipants();
    res.status(200).json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
});

router.get('/participantes-details', async (req, res) => {
  try {
    /*     const totalParticipantes = await pool.query(
      'SELECT COUNT(*) FROM participantes WHERE logout IS NULL'
    ); */

    res.status(200).json(mockUsers);
  } catch (error) {
    console.error('Erro ao obter contagem de participantes:', error);
    res.status(500).json({ error: 'Erro ao obter contagem de participantes' });
  }
});

router.post('/set-proximo-premio', async (req, res) => {
  try {
    const { premio } = req.body;
    if (!premio) {
      return res.status(400).json({ error: 'Prêmio não fornecido' });
    }

    /*     await pool.query('INSERT INTO premios (premio) VALUES ($1)', [premio]);
     */

    res.status(200).json({ message: 'Prêmio cadastrado com sucesso' });
  } catch (error) {
    console.error('Erro ao cadastrar prêmio:', error);
    res.status(500).json({ error: 'Erro ao cadastrar prêmio' });
  }
});

router.get('/sortear', async (req, res) => {
  try {
    /*     const sorteado = await pool.query(
      'SELECT * FROM participantes WHERE logout IS NULL ORDER BY RANDOM()  LIMIT 1'
    );

    const premio =  await pool.query('SELECT * FROM premios ORDER BY RANDOM() LIMIT 1');

    const sorteioObject = {
      participante_id: sorteado.rows[0].uuid,
      participante_name: sorteado.rows[0].name,
      premio_uuid: premio.rows[0].premio,
      premio_name: premio.rows[0].name,
      data: new Date(),
    }; */

    const date = new Date();

    const formatDate = (date) => {
      const addZero = (num) => (num < 10 ? `0${num}` : num);
      const formattedDate = `${addZero(date.getDate())}/${addZero(
        date.getMonth() + 1
      )}/${date.getFullYear()} ${addZero(date.getHours())}:${addZero(
        date.getMinutes()
      )}:${addZero(date.getSeconds())}`;
      return formattedDate;
    };
    const formattedDate = formatDate(date);

    const sorteado = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const premio = mockPremios[Math.floor(Math.random() * mockPremios.length)];
    const mockSorteioObject = {
      participante_id: sorteado.uuid,
      participante_name: sorteado.name,
      premio_uuid: premio.uuid,
      premio_name: premio.name,
      data: formattedDate,
    };

    broadcastSorteio(sorteado.uuid);
    res.status(200).json(mockSorteioObject);
  } catch (error) {
    console.error('Erro ao obter sorteios:', error);
    res.status(500).json({ error: 'Erro ao obter sorteios' });
  }
});

router.get('/reset-sorteio', async (req, res) => {
  try {
    mockUsers.length = 0;
    broadcastParticipants(true);

    removeAllWebsocketConnection();
    res.status(200).json({ message: 'Sorteio resetado com sucesso' });
  } catch (error) {
    console.error('Erro ao resetar sorteio:', error);
    res.status(500).json({ error: 'Erro ao resetar sorteio' });
  }
})

router.get('/is-alive', async (req, res) => {
  res.status(200).json({ message: 'Im still alive' });
});

app.use(cors());
app.use('/api', router);

function handleIncomingMessage(message) {
  const parsedMessage = JSON.parse(message);
  if (parsedMessage.action === 'login') {
    broadcastParticipants();
  }
  if (parsedMessage.action === 'logout') {
    broadcastParticipants();
  }
  if (parsedMessage.action === 'sorteio') {
    broadcastSorteio(parsedMessage.sorteio);
  }
}
app.ws('/ws', (ws, req) => {
  ws.on('close', function () {
    broadcastParticipants();
  });
  ws.on('message', handleIncomingMessage);
});

function removeAllWebsocketConnection() {
  aWss.getWss().clients.forEach(function (client) {
    client.close();
  });
}
async function broadcastParticipants(reset = false) {
  aWss.getWss().clients.forEach(function (client) {
    client.send(JSON.stringify({ action: 'participantes', participantes: reset ? -1 : mockUsers.length }));
  });
}

async function broadcastSorteio(sorteio) {
  aWss.getWss().clients.forEach(function (client) {
    client.send(JSON.stringify({ action: 'sorteio', numeroSorteado: sorteio }));
  });
}

app.listen(8085, () => {
  console.log('API rodando na porta 8085');
});
