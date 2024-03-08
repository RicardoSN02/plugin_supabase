//este service worker se encargara de guardar el video en la ontologia
/*
chrome.storage.local.remove('arregloGuardar', function() {
    console.log('Se eliminó el arreglo de búsqueda de videos.');
  });
*/

chrome.storage.local.get('arregloGuardar', function(result) {
    console.log("arreglo Guardar: ",result.arregloGuardar);
    if (!result.arregloGuardar) {
      chrome.storage.local.set({ 'arregloGuardar': [] }, function() {
        console.log('se creo un array para almacenar los videos pendientes en la ontologia');
      });
    }else{
    }
});

function guardarArregloVideo(informacionLlamada){
    chrome.storage.local.get('arregloGuardar', function(result) {

    console.log(informacionLlamada, " se agrego a la cola de de guardar en ontologia");

    result.arregloGuardar.push(informacionLlamada);
  
      chrome.storage.local.set({ 'arregloGuardar': result.arregloGuardar}, function() {
        console.log('Array de guardar video actualizado');
        console.log(result.arregloGuardar)
  
        //comienza el funcionamiento de las colas tras actualizar
        if(result.arregloGuardar.length  === 0){
          console.log("no hay videos en la cola de guardar video") 
        }else{
          colasGuardarVideo();
        }
      });
      
    });
}

async function colasGuardarVideo(){
    chrome.storage.local.get('arregloGuardar', function(result) {  
      if(result.arregloGuardar.length === 0){
         console.log("no hay videos pendientes en la cola de guardar video") 
      }else{
         let videoGuardar = result.arregloGuardar[0];
         console.log("voy a guardar el siguiente video: ",videoGuardar.nombreLlamada)
        
        setTimeout(() => {
           guardarVideo(videoGuardar);
        }, 5000);  
      }
   });
}   

function guardarVideo(videoGuardar){
    if(videoGuardar.id){
     let init = {
       method: 'POST',
       async: true,
       body: JSON.stringify({
        "title": videoGuardar.nombreLlamada,
        "url":`https://drive.google.com/file/d/${videoGuardar.id}`,
        "email":emailGuardar,
        "created_at":getCurrentFormattedDate(),
        "views":0
      })
       ,
       headers: {
         'Content-Type': 'application/json'
       },
       'contentType': 'json'
     };
     fetch(
       `https://stunning-capybara-1efe1a.netlify.app/.netlify/functions/api/videos`,
         init)
        .then((response) => {
          console.log(response)

          if(response.status !== 201){
            throw new Error("errorGuardar");
          }
          
          return response.json();

        }) 
       .then(function(data) {
           console.log(data);
           if(videoGuardar.etiquetas.length === 0){
              console.log( "video sin etiquetas guardado")
           }else{
             guardarEnCola(videoGuardar.id,videoGuardar.etiquetas);
             guardarSiguiente();
           }           

       }).catch((error) => {
        if(error.message === "errorGuardar"){
          console.error("Ha fallado la consulta de guardar video con el sig error");
          console.error(error);
          console.error("Se reintentara el guardado dentro de 20 segundos")
  
          setTimeout(() => {
             colasGuardarVideo();
          }, 20000);          
        }else{
          console.log("se guardo el video con exito")
        }

       });
    }
  }

  //borra el que se acaba de agregar de la cola y vuelve a lanzar la cola 
  function guardarSiguiente(){
    chrome.storage.local.get('arregloGuardar', function(result) {

        result.arregloGuardar.shift();
  
        chrome.storage.local.set({ 'arregloGuardar': result.arregloGuardar}, function() {
          console.log('Array de guardado de video actualizado');
          console.log(result.arregloGuardar);
    
          //comienza el funcionamiento de las colas tras actualizar
          if(result.arregloGuardar.length === 0){
            console.log("no hay mas videos del cual guardar en la ontologia") 
          }else{
            setTimeout(() => {
              colasGuardarVideo();
           }, 5000); 
          
          }
        });

      });
  }

  function getCurrentFormattedDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;
  }