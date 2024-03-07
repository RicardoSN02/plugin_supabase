/**
 * Se crea un elemento tipo botón que se encontrará sobrepuesto por encima de todas las páginas web
 */

let button = document.createElement("button")
button.id = "botonPicame"
button.innerText = "Iniciar grabación"
document.getElementsByTagName("body")[0].appendChild(button)

/**
 * Le damos una función al botón
 */
button.addEventListener('click',()=>{


    let referencia = localStorage.getItem('contador')
    let contador = JSON.parse(referencia)
    
    if(contador.activo == false){
        contador.activo = true
    } else if (contador.activo == true){
        contador.activo = false
    }
    localStorage.setItem('contador',JSON.stringify(contador))

    
    //Le manda el mensaje al background
    chrome.runtime.sendMessage({button:"clicked"}, function(response){
        console.log(response.text);
    })

});
