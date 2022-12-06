const express = require('express');

const app = express();
const fs = require('fs');

class Contenedor {
    constructor(path){
        this.path = path
    }
    async save(info){
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8')
            let data_parsed = JSON.parse(data)
            const index_on_use = Object.keys(data_parsed)

            // Get unused id
            let save_to_index = 0
            do {
                save_to_index++
            } while (index_on_use.includes(save_to_index.toString()))

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


app.get('/productos', (req, res) => {
    contenedor.getAll().then(data => res.json(data))
});

app.get('/productoRandom', (req, res) => {
    contenedor.getAll().then(data => {
        const keys = Object.keys(data)
        const random_key = keys[Math.floor(Math.random() * keys.length)]
        res.json(data[random_key])
    })
});

app.listen(4000, () => {
    console.log("Server is listening on port 4000");
});