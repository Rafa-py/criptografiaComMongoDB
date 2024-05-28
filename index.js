// config inicial
const express = require('express')
const app = express()

// depois do db
const mongoose = require('mongoose')
const crypto = require('crypto');
const Person = require('./models/Person')


// Criando função p/ criptografar senhas
const cipher = {
    algorithm : "aes256",
    secret : "chaves",
    type : "hex"
};

async function getCrypto(password) {
    return new Promise((resolve, reject) => {
        const cipherStream = crypto.createCipher(cipher.algorithm, cipher.secret);
        let encryptedData = '';

        cipherStream.on('readable', () => {
            let chunk;
            while (null !== (chunk = cipherStream.read())) {
                encryptedData += chunk.toString(cipher.type);
            }
        });

        cipherStream.on('end', () => {
            resolve(encryptedData);
        });

        cipherStream.on('error', (error) => {
            reject(error);
        });

        cipherStream.write(password);
        cipherStream.end();
    });
}

//Configurando API para ler JSON
app.use(
  express.urlencoded({
    extended: true,
  }),
)

app.use(express.json())

// Rotas
app.post('/person', async (req, res) => {
    let { email, pass } = req.body;
    try {
        let newPass = await getCrypto(pass);
        const person = {
            email,
            pass: newPass,
        };
        await Person.create(person);
        res.status(201).json({ message: 'Pessoa inserida no sistema com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: error });
    }
});


// O R do CRUD 
app.get('/person', async (req, res) => {
  try {
    const people = await Person.find()

    res.status(200).json(people)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

// Login do Usuário
app.post('/login', async (req, res) => {
    let { email, pass } = req.body;
    try {
        let encryptedPass = await getCrypto(pass);
        const person = await Person.findOne({ email, pass: encryptedPass });
        if (!person) {
            res.status(422).json({ message: 'Credenciais inválidas!' });
            return;
        }
        res.status(200).json({ message: 'Usuário Logado', user: person });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Conectando ao banco
mongoose.connect(`mongodb://localhost:27017`).then(()=>{
    console.log("Conectamos ao mongoDB")
    app.listen(3000)
})
.catch((err)=>{
    console.log(err)
})


