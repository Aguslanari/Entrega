const socket = io()

const form = document.getElementById('formProduct')

form.addEventListener('submit', (e) => {
    e.preventDefault()
    const datForm = new FormData(e.target) //El formulario que disparo el evento
    const prod = Object.fromEntries(datForm) //Dado un objeto iterable, te devuelvo sus datos en un objeto simple
    socket.emit('nuevoProducto', prod)
    socket.on('createRespose', (mensaje) => {

        Swal.fire(
            mensaje
        )
    })
    e.target.reset()

})

socket.on('loadProducts', newProducts => {
    productsInRealTime.innerHTML = "" //Limio el html
    newProducts.forEach(product => {
        productsInRealTime.innerHTML += `<p> ID: ${product.id} TITULO: ${product.title} </p> <button onclick="deleteProd(${product.id})"> ELIMINAR </button>`
    })
})

function deleteProd (pId){
    socket.emit('borrarProducto', pId)
}



