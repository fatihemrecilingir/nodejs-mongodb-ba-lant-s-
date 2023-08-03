const { MongoClient } = require("mongodb");
const express = require('express');
const app = express();
const path = require('path');

async function connect(){

    const uri ="mongodb+srv://kullanici:eLaR5yjt525ZMJ4e@cluster0.q5dsobf.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    await client.connect();
    const dbName = "business";
    const collectionName = "employees";
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return { client, collection,db };
}

async function add() {

    const employee = [
        {
        firstName: "fatih",
        lastName: "emre",
        age: 21,
        id_num:11111111,
        department: "mühendis",
        gender : "erkek"
        }
    ];
    const { client, collection } = await connect();

    try {
        await collection.insertMany(employee);
        
    } catch (err) {
        console.error(`Çalışan Eklenemedi: ${err}\n`);
    } finally{
        await client.close();
    }
  
}

async function findOne(input){

    const { client, collection } = await connect(); 
    const findOneQuery = {firstName : input};

    try {
        const findOneResult = await collection.findOne(findOneQuery);
        if (findOneResult === null) {
            return { status: 404, message: "Kullanıcı bulunamadı." };
        } else {
            return findOneResult;
        }
    } catch (err) {
        return { status: 500, message: "Hata oluştu." };
    }
    finally{
        await client.close();
    }
}

async function findAll() {
    const { client, collection } = await connect();
  
    try {
      const allEmployees = await collection.find({}).toArray();
      return allEmployees;
    } catch (err) {
      console.error('Hata oluştu:', err);
      return { status: 500, message: 'Hata oluştu.' };
    } finally {
      await client.close();
    }
  }

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index2.html'));
  });

app.get('/search', async (req, res) => {
    try {
        const input = req.query.input;
        find = await findOne(input);

        if (find.status === 404) {
            return res.status(404).json({ message: find.message });
          } else if (find.status === 500) {
            return res.status(500).json({ message: find.message });
          }

        res.json(find);

        } catch (err) {
          console.error('Hata oluştu:', err);
          res.status(500).send('Hata oluştu.');
        }
});

app.get('/add', async (req, res) => {
    await add();
    res.send("eklendi");
});

app.get('/all', async (req, res) => {
    try {
      const allEmployees = await findAll();
  
      if (allEmployees.status === 500) {
        return res.status(500).json({ message: allEmployees.message });
      }
  
      res.json(allEmployees);
    } catch (err) {
      console.error('Hata oluştu:', err);
      res.status(500).send('Hata oluştu.');
    }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Uygulama 127.0.0.1:${port}'de çalışıyor.`);
});
