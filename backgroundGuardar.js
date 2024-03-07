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
        "artifactName": videoGuardar.nombreLlamada,
        "artifactLocation": `https://drive.google.com/file/d/${videoGuardar.id}`,
        "artifactFormat": "mp4",
        "artifactTags": [],
        "isMadeBy": "",
        "hasUsedIn": "",
        "hasTaggedBy": "",
        "isUsedBy": ""
       })
       ,
       headers: {
         'Content-Type': 'application/json'
       },
       'contentType': 'json'
     };
     fetch(
       `https://apivideotagger.borrego-research.com/webserviceontology/videotagger/videos/save`,
         init)
       .then((response) => response.json())
       .then(function(data) {
           console.log(data);
           if(videoGuardar.etiquetas.length === 0){
              console.log( "video sin etiquetas guardado")
           }else{
             guardarEnCola(videoGuardar.id,videoGuardar.etiquetas);
             guardarSiguiente();
           }           

       }).catch((error) => {
        console.error("Ha fallado la consulta de guardar video con el sig error");
        console.error(error);
        console.error("Se reintentara el guardado dentro de 10 segundos")

        setTimeout(() => {
           colasGuardarVideo();
        }, 10000);
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
            colasGuardarVideo();
          }
        });

      });
  }