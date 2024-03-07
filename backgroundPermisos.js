/*
  Este service worker se encargara de cambiar los permisos de un video de manera asincrona
*/


/*
chrome.storage.local.remove('arregloPermisos', function() {
    console.log('Se eliminó el arreglo de búsqueda de videos.');
  });
*/

chrome.storage.local.get('arregloPermisos', function(result) {
    console.log("arreglo permisos: ",result.arregloPermisos);
    if (!result.arregloPermisos) {
      chrome.storage.local.set({ 'arregloPermisos': [] }, function() {
        console.log('se creo un array para almacenar videos pendientes por cambiarle los permisos');
      });
    }else{

    }
});

function guardarEnPermisos(informacionLlamada){
    chrome.storage.local.get('arregloPermisos', function(result) {

    console.log(informacionLlamada, " se agrego a la cola de permisos de id");

    result.arregloPermisos.push(informacionLlamada);
  
      chrome.storage.local.set({ 'arregloPermisos': result.arregloPermisos}, function() {
        console.log('Array de permisos actualizado');
        console.log(result.arregloPermisos)
  
        //comienza el funcionamiento de las colas tras actualizar
        if(result.arregloPermisos.length  === 0){
          console.log("no hay tags en la cola de cambio de permisos") 
        }else{
          colasPermisos();
        }
      });
      
    });
}

async function colasPermisos(){
    chrome.storage.local.get('arregloPermisos', function(result) {  
      if(result.arregloPermisos.length === 0){
         console.log("no hay videos pendientes en la cola de cambio de permisos") 
      }else{
         let videoCambiar = result.arregloPermisos[0];
         console.log("voy a cambiar los permisos de la siguiente llamada: ",videoCambiar.nombreLlamada)
        
        setTimeout(() => {
           cambiarPermisos(videoCambiar);
        }, 5000);  
      }
   });
}   

function cambiarPermisos(videoCambiar){
    if(videoCambiar.id){
     let init = {
       method: 'POST',
       async: true,
       body: JSON.stringify({
         "role": "writer",
         "type": "anyone"
       })
       ,
       headers: {
         Authorization: 'Bearer ' + tokenGuardar,
         'Content-Type': 'application/json'
       },
       'contentType': 'json'
     };
     fetch(
       `https://www.googleapis.com/drive/v3/files/${videoCambiar.id}/permissions`,
         init)
       .then((response) => response.json())
       .then(function(data) {
           console.log(data);

           chrome.storage.local.get('arregloPermisos', function(result) {

            result.arregloPermisos.shift();
      
            chrome.storage.local.set({ 'arregloPermisos': result.arregloPermisos}, function() {
              console.log('Array actualizado');
              console.log(result.arregloPermisos)
        
              //comienza el funcionamiento de las colas tras actualizar
              if(result.arregloPermisos.length === 0){
                console.log("no hay mas videos por cambiarle los permisos") 
              }else{
                colasPermisos();
              }
            });
  
            
          });

       }).catch((error) => {
        console.error("Ha fallado la consulta de cambio de permisos con el sig error");
        console.error(error);
        console.error("Se reintentara el cambio dentro de 10 segundos")

        setTimeout(() => {
           colasPermisos();
        }, 10000);
       });
    }
  }