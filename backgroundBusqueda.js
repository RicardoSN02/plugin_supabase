/**
 * este service worker se encargara de realizar las consultas relacionadas a la busqueda 
 * de id del video
 */



//funcion para eliminar elementos del localstorage
/*
chrome.storage.local.remove('arregloBusquedaVideo', function() {
    console.log('Se eliminó el arreglo de búsqueda de videos.');
  });
*/
/*
chrome.storage.local.remove('arregloBusquedaVideo', function() {
  console.log('Se eliminó el arreglo de búsqueda de videos.');
});
*/
/*
chrome.storage.local.set({ 'arregloBusquedaVideo': [JSON.stringify({nombreLlamada: "yzw-vfbv-ffz",fechaLlamada:"2024-02-22 22:29",etiquetas:["etiqueta","asdfas"]}),
                                                    JSON.stringify({nombreLlamada: "yzw-vfbv-ffz",fechaLlamada:"2024-02-22 22:29",etiquetas:["etiqueta","asdfas"]})] }, function() {
  console.log('se creo un array para almacenar las etiquetas sin id encontrado');
});
*/


chrome.storage.local.get('arregloBusquedaVideo', function(result) {
    console.log("arreglo busqueda: ",result.arregloBusquedaVideo);
    if (!result.arregloBusquedaVideo) {
      chrome.storage.local.set({ 'arregloBusquedaVideo': [] }, function() {
        console.log('se creo un array para almacenar videos por guardar');
      });
    }else{

    }
});

function guardarEnBusqueda(nombreLlamada,fechaLlamada,arregloEtq){
    chrome.storage.local.get('arregloBusquedaVideo', function(result) {
      
    let infoLlamada = JSON.stringify({
               "nombreLlamada":nombreLlamada,
               "fechaLlamada":fechaLlamada,
               "etiquetas":arregloEtq
               });

    console.log(infoLlamada, " se agrego a la cola de busqueda de id");

    result.arregloBusquedaVideo.push(infoLlamada);
  
      chrome.storage.local.set({ 'arregloBusquedaVideo': result.arregloBusquedaVideo}, function() {
        console.log('Array de busqueda actualizado');
        console.log(result.arregloBusquedaVideo)
  
        //comienza el funcionamiento de las colas tras actualizar
        if(result.arregloBusquedaVideo.length  === 0){
          console.log("no hay tags en la cola de busqueda de videos") 
        }else{
          colasBusquedaVideo();
        }
      });
      
    });
}

async function colasBusquedaVideo(){
    chrome.storage.local.get('arregloBusquedaVideo', function(result) {  
      if(result.arregloBusquedaVideo.length === 0){
         console.log("no hay videos pendientes en la cola de busqueda") 
      }else{
         let primerVideo = JSON.parse(result.arregloBusquedaVideo[0]);
         console.log("voy a comenzar la busqueda de la siguiente llamada",primerVideo.nombreLlamada,primerVideo.fechaLlamada)
  
        consultarApi(primerVideo);

      }
      
    });
}

function consultarApi(primerVideo){
    let init = {
      method: 'GET',
      async: true,
      headers: {
        Authorization: 'Bearer ' + tokenGuardar,
        'Content-Type': 'application/json'
      },
      'contentType': 'json'
    };
    fetch(
      `https://www.googleapis.com/drive/v3/files?q=mimeType contains 'video/'`,
        init)
        .then((response) => response.json())
        .then(function(data) {
            const arreglo = data.files;
            console.log("arreglo completo:", arreglo);
            
            for (let i = 0; i < arreglo.length; i++) {
               if(arreglo[i].name.includes(primerVideo.fechaLlamada) &&  arreglo[i].name.includes(primerVideo.nombreLlamada)){
                 console.log("se encontro la llamada");
                 console.log("id: ",arreglo[i].id);
                 console.log("name: ",arreglo[i].name);
                 
                 let infoLlamadaActualizado = {
                    "nombreLlamada":primerVideo.nombreLlamada,
                    "fechaLlamada":primerVideo.fechaLlamada,
                    "etiquetas":primerVideo.etiquetas,
                    "id":arreglo[i].id
                 }; 
                 
                 buscarSiguiente(infoLlamadaActualizado);

                 break;
               }else{
                

               }
            }
            
            console.log("todavia no se encuentra el id")
            setTimeout(() => {
              colasBusquedaVideo();
           }, 300000);
        }).catch((error) => {
            console.error("Ha fallado la consulta con el sig error");
            console.error(error);

            setTimeout(() => {
              colasBusquedaVideo();
           }, 10000);
            
        });
  }
  
  
function buscarSiguiente(infoLlamadaActualizado){
  chrome.storage.local.get('arregloBusquedaVideo', function(result) {

    result.arregloBusquedaVideo.shift();

    chrome.storage.local.set({ 'arregloBusquedaVideo': result.arregloBusquedaVideo}, function() {
      console.log('Array actualizado');
      console.log(result.arregloBusquedaVideo);

      guardarArregloVideo(infoLlamadaActualizado); 
      guardarEnPermisos(infoLlamadaActualizado);  

      if(result.arregloBusquedaVideo.length === 0){
        console.log("no hay mas videos para buscar en la cola") 
      }else{
        colasBusquedaVideo();
      }
    });

    
  });
}

/*
//funcion para eliminar elementos del localstorage

chrome.storage.local.remove('arregloBusquedaVideo', function() {
    console.log('Se eliminó el arreglo de búsqueda de videos.');
  });
*/