//variables para controla el estado de grabando o no grabando
let botonGrabacionConfigurado = false;
let botonGrabacionExiste = false;

let botonDetenerGrabacionConfigurado = false;
let botonDetenerGrabacionExiste = false;

let estadoGrabacion = false;

//funcion que ayuda a crear una fecha con el formato aaaa-mm-dd
function crearFecha(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const day = String(date.getDate()).padStart(2, '0'); 
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

//funcion que se lanza en el mutant observer para 
function esperarElemento() {
  if(!estadoGrabacion){
    noEstaGrabando();
  }else{
    estaGrabando();
  }
}

//funcion que maneja el contenido de la pagina cuando no se esta grabando
function noEstaGrabando(){
  //si aparece el elemento para iniciar la grabacion comienza la funcion lo obtiene
  let botonGrabacion = document.querySelector('button[data-idom-class="ksBjEc lKxP2d LQeN7 AjXHhf"][data-mdc-dialog-action="A9Emjd"]');
    
  if (botonGrabacion) {
        //setea que la grabacion de la llamada esta activa
        botonGrabacionExiste = true;

        //si no se ha configurado el boton para iniciar la grabacion
        if(!botonGrabacionConfigurado){

          console.log("se configuro el boton de iniciar grabacion final"); 
          
          //le agrega un listener al boton para iniciar la grabacion
          botonGrabacion.addEventListener('click', function(){
            //aqui va lo que se hace cuando se termina la grabacion
              console.log("se esta grabando")
              //cambia el estado la grabacion a true (se esta grabando la llamada)
              estadoGrabacion = true;
              //toma el nombre de la llamada y la fecha, los manda a background
              //en background se almacenan esos valores y se lanza el popup con el contador iniciado
              var objeto = document.querySelector('[jsname="NeC6gb"]');
                      
              if (objeto) {
                  var texto = objeto.textContent;
                  var fecha = crearFecha(new Date());
                  console.log(texto," fecha: ",fecha);
                  chrome.runtime.sendMessage({ action: 'grabando',nombreLlamada: texto, fechaLlamada: fecha });
              } else {
                  console.log("No se encontró el elemento.");
              }

          });
          //el boton de grabacion se configuro con exito
          botonGrabacionConfigurado = true;
        }else{
          //el boton ya esta configurado lo que evita la repeticion 
          console.log("el boton ya esta configurado");
        }  
   //si el boton de grabacion deja de existir
  }else if(botonGrabacionExiste){
    //setea los valores configurados a nada
    botonGrabacionExiste = false;
    botonGrabacionConfigurado = false;
    console.log("boton ha desaparecido");
  }    
}

//funcion que maneja el contenido de la pagina con el mutant observer
// si se esta grabando la llamada
function estaGrabando(){
  //obtiene el boton de detener la grabacion
  let botonDetenerGrabacion = document.querySelector('button[data-idom-class="ksBjEc lKxP2d LQeN7 AjXHhf"][data-mdc-dialog-action="A9Emjd"]');
    
  //si existe el boton de detener la grabacion
  if (botonDetenerGrabacion) {
        //cambia el estado a true
        botonDetenerGrabacionExiste = true;

        //si no se ha configurado el boton para detener la grabacion
        if(!botonDetenerGrabacionConfigurado){
          console.log("se configuro el boton de detener grabacion final"); 
        
          //le agrega un evento de click 
          botonDetenerGrabacion.addEventListener('click', function(){
            //aqui va lo que se hace cuando se termina la grabacion
            //se informa que se detuvo la grabacion y se cambia el estado de grabacion a false (no se esta grabando) 
              console.log("se detuvo la grabacion")
 
              
              estadoGrabacion = false;
              chrome.runtime.sendMessage({ action: 'detenido' });

              //var objeto = document.querySelector('[jsname="NeC6gb"]');
                      
              //if (objeto) {
                  //var texto = objeto.textContent;
                  //console.log(texto," fecha: ",crearFecha(new Date()));
                  //chrome.runtime.sendMessage({ action: 'botonPresionado' });
              //} else {
                  //console.log("No se encontró el elemento.");
              //}

          });

          //se configuro el boton de detener grabacion
          botonDetenerGrabacionConfigurado = true;
        }else{
          console.log("el boton ya esta configurado");
        }  

        //si el boton de detener grabacion deja de existir
  }else if(botonDetenerGrabacionExiste){
    //cambia el estado a false
    botonDetenerGrabacionExiste = false;
    botonDetenerGrabacionConfigurado = false;
    console.log("boton ha desaparecido");
  }    
}

  
  //mutation observer
  const observer = new MutationObserver(function(mutationsList, observer) {
    esperarElemento();
  });
  
  //elige el objetivo
  const targetNode = document;
  
  //configuracion
  const config = { childList: true, subtree: true };
  
  //comienza a observar cambios en el dom
  observer.observe(targetNode, config);

  /* codigo cuando comienza la grabacion
                        var objeto = document.querySelector('[jsname="NeC6gb"]');
                        
                        if (objeto) {
                            var texto = objeto.textContent;
                            console.log(texto," fecha: ",crearFecha(new Date()));
                            chrome.runtime.sendMessage({ action: 'botonPresionado' });
                        } else {
                            console.log("No se encontró el elemento.");
                        }
*/

let meetVentana = window;

window.addEventListener('unload', function(event) {
  chrome.runtime.sendMessage({ action: 'meetCerrado' });
});