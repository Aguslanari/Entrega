import { promises as fs } from 'fs'

export class ProductManager {
    constructor(path) {
        this.products = [];
        this.path = path
    }

    idGenerator = async () => {

        if (!this.idIncrement) {

            if (this.products.length == 0) {
                this.idIncrement = 0;
            }
            else {
                const productsId = this.products.map(p => p['id']);
                this.idIncrement = Math.max(...productsId);
            }
        }

        this.idIncrement++
        return this.idIncrement
    }

    incializeProducts = async () => {
        const data = await fs.readFile(this.path, 'utf8');
        this.products = JSON.parse(data);

        if (this.products.length == 0) {
            console.log("No se encontraron productos en el archivo");
            return false;
        }

        return true;
    }

    //Creamos metodo global para guardar en el JSON
    saveInJson = async () => {
        await fs.writeFile(this.path, JSON.stringify(this.products));
    }

    add = async (product) => {
        if (!this.arePropertiesValid(product)) {
            console.log("El producto no tiene todas las propiedades");
            return false;
        }
        await this.incializeProducts();

        let alreayExist = this.products.find(p => p.code === product.code);

        if (alreayExist) {
            console.log("Ya existe un producto con ese codigo");
            return false;
        }

        product.id = await this.idGenerator();
        this.products.push(product);
        await this.saveInJson();
        console.log(`Se agregó el producto con ID: ${product.id}`);
        return true
    }

    getAll = async (limit = 0) => {
        try {
            await this.incializeProducts();

            if (limit > 0)
                this.products = this.products.slice(0, limit);

            return this.products;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }

    delete = async (productId) => {
        await this.incializeProducts();
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            console.log(`No se encontró el producto con ID: ${productId}`);
            return false;
        }

        for (let i = 0; i < this.products.length; i++) {
            if (this.products[i].id === productId) {
                this.products.splice(i, 1);
            }
        }

        await this.saveInJson();
        return true;
    }

    udpate = async (productId, newProduct) => {
        try {
            await this.incializeProducts();


            if (!this.arePropertiesValid(newProduct)) {
                console.log("El producto no tiene todas las propiedades");
                return false;
            }

            const productIndex = this.products.findIndex(p => p.id === productId);
            if (productIndex === -1) {
                console.log(`No se encontró el producto con ID: ${productId}`);
                return false;
            }

            this.products[productIndex] = {
                ...newProduct,
                id: productId
            };

            await this.saveInJson();
            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }

    getById = async (productId) => {
        try {
            const data = await fs.readFile(this.path, 'utf8');
            let fileResponse = JSON.parse(data);

            let prod = fileResponse.find(p => p.id === productId);
            if (prod) {
                return prod;
            }
        }
        catch (err) {
            console.error(err);
            return;
        }
    }

    arePropertiesValid = (product) => {
        const props = [
            'title', 'description', 'code', 'price', 'status',
            'stock', 'category', 'thumbnails'
        ];

        const invalidProps = props.filter(prop => !(prop in product));

        if (invalidProps.length > 0) {
            console.log(`Faltan las siguientes propiedades: ${invalidProps.join(', ')}`)
            return false;
        }
        return true;
    }
}