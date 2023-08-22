import express from 'express'
import multer from 'multer'
import { engine } from 'express-handlebars'
import { Server } from 'socket.io'
import routerProd from './routes/products.routes.js'
import { __dirname } from './path.js'
import { ProductManager } from "./controllers/ProductManager.js";

import path from 'path'
const PORT = 8080
const app = express()

//Server
const server = app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`)
})
const productManager = new ProductManager('src/models/products.json');
const io = new Server(server)

//Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true })) //URL extensas

app.engine('handlebars', engine()) //Defino que voy a trabajar con hbs y guardo la config
app.set('view engine', 'handlebars')
app.set('views', path.resolve(__dirname, './views'))

//Conexion de Socket.io
io.on("connection", async (socket) => {
    socket.on('nuevoProducto', async (prod) => {
        console.log(prod)
        const confirm = await productManager.add(prod);
        let message = "El producto se creo correctamente";

        if (!confirm)
            message = "NO se pudo crear el producto"

        socket.emit("createRespose", message);

        let prods = await productManager.getAll();
        socket.emit("loadProducts", prods)
    })

    socket.on('borrarProducto', async (prod) => {
        console.log(prod)
        await productManager.delete(prod);

        let prods = await productManager.getAll();
        socket.emit("loadProducts", prods)
    })

    let prods = await productManager.getAll();
    socket.emit("loadProducts", prods)
})

//Routes
app.use('/', express.static(path.join(__dirname, '/public'))) //path.join() es una concatenacion de una manera mas optima que con el +
app.use('/realtimeproducts', express.static(path.join(__dirname, '/public'))) //path.join() es una concatenacion de una manera mas optima que con el +
app.use('/api/product', routerProd)

//HBS
app.get('/', async (req, res) => {
    //Indicar que plantilla voy a utilizar
    let prods = await productManager.getAll();
    console.log(prods)
    res.render("products", {
        products: prods,
        rutaCSS: "products",
        rutaJS: "products"
    })
})
app.get('/realtimeproducts', (req, res) => {
    //Indicar que plantilla voy a utilizar

    res.render("realTimeProducts", {
        rutaCSS: "realTimeProducts",
        rutaJS: "realTimeProducts"
    })
})