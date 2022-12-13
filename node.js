const express = require('express');
const multer  = require('multer');
const upload = multer();

const app = express();
const fs = require('fs');

class Contenedor {
    constructor(path){
        this.path = path
    }
    async save(info, id = null){
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8')
            let data_parsed = JSON.parse(data)
            const index_on_use = Object.keys(data_parsed)

            // Get unused id
            let save_to_index = 0

            if(!id) {
                do {
                    save_to_index++
                } while (index_on_use.includes(save_to_index.toString()))
            } else {
                save_to_index = id
            }

            data_parsed = {...data_parsed, [save_to_index]: info}

            await fs.promises.writeFile(this.path, JSON.stringify(data_parsed), 'utf-8')
            console.log("Saved to index "+save_to_index)
            return 0
        }
        catch (error){
            console.log(error)
        } 
    }
    async getById(id){
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8')
            let data_parsed = JSON.parse(data)
            return data_parsed[id]
        } catch (error) {
            console.log(error)
        }
    }
    async getAll(){
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8')
            let data_parsed = JSON.parse(data)
            return data_parsed
        } catch (error) {
            console.log(error)
        }
    }
    async deleteById(id){
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8')
            let data_parsed = JSON.parse(data)
            delete data_parsed[id]
            await fs.promises.writeFile(this.path, JSON.stringify(data_parsed), 'utf-8')
            console.log(id+" deleted")
            return 0
        } catch (error) {
            console.log(error)
        }
    }
    async deleteAll(){
        try {
            await fs.promises.writeFile(this.path, JSON.stringify({}), 'utf-8')
            console.log("All deleted")
            return 0
        } catch (error) {
            console.log(error)
        }
    }
}

const textoAguardar = {
    title: "Item",
    price: 1002222,
    thumbnail: "http://algo.com"
}

const contenedor = new Contenedor('./productos.txt')

// contenedor.save(textoAguardar)
// contenedor.getById(1).then((data) => console.log(data))
// contenedor.getAll().then(data => console.log(data))
// contenedor.deleteById(1)
// contenedor.deleteAll()


app.get('/api/productos', (req, res) => {
    contenedor.getAll().then(data => res.json(data))
});

app.get('/api/productos/:id', async (req, res) => {
    const item = await contenedor.getById(req.params.id)
    if(item){
        res.json(item)
    } else {
        res.json({error: 'Id ' + req.params.id + ' not found'})
    }
});

app.post('/api/productos', upload.any(), (req, res) => {
    console.log(req.body)
    res.setHeader('Content-Type', 'application/json');
    if (req.body && req.body.title && req.body.price && req.body.thumbnail){
        contenedor.save(req.body).then(data => res.send({status: 'Added successfully'}))
    } else {
        res.send({error: "Missing parameters (title, price, thumbnail)"})
    }
});

app.put('/api/productos/:id', upload.any(), async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.body.title && req.body.price && req.body.thumbnail){
        const item = await contenedor.getById(req.params.id)
        if(item){
            contenedor.deleteById(req.params.id)
            contenedor.save(req.body, req.params.id).then(data => res.send({status: 'Id ' + req.params.id + ' edited successfully'}))
        } else {
            res.json({error: 'Id ' + req.params.id + ' not found'})
        }

    } else {
        res.send({error: "Missing parameters (title, price, thumbnail)"})
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    const item = await contenedor.getById(req.params.id)
    if(item){
        contenedor.deleteById(req.params.id).then(data => res.json({status: 'Id ' + req.params.id + ' deleted successfully'}))
    } else {
        res.json({error: 'Id ' + req.params.id + ' not found'})
    }
});

app.use(express.urlencoded({ extended: true }));

// app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});