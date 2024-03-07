/**
 * este service worker se encargara de realizar las consultas relacionadas a las colas
 */

//codigo comentado siguiente es para limpiar el array de colas para pruebas

/*
chrome.storage.local.remove('arregloColas', function() {
  console.log('Se eliminó el arreglo de búsqueda de videos.');
});
*/
/*
 var dataToSave = {
    arregloColas: ["pruebanuevaestructurapruebaespecial,00:17:27.000,10uTwj1Gp9Ib0cceReQXdddEiGafh-bk0"],
    someOtherData: 'value'
  };
  
  chrome.storage.local.set(dataToSave, function() {
    console.log('Data saved successfully');
  });
*/


chrome.storage.local.get('arregloColas', function(result) {
    console.log("arreglo colas: ",result.arregloColas)
    if (!result.arregloColas) {
      chrome.storage.local.set({ 'arregloColas': [] }, function() {
        console.log('se creo un array para almacenar las etiquetas para uso de las colas');
      });
    }else{

    }
  });

function guardarEnCola(id,arregloEtq){
  chrome.storage.local.get('arregloColas', function(result) {
    
    arregloEtq.forEach(element => {
      console.log(element, " agregado a colas")
      result.arregloColas.push(element+`,${id}`);
    });
    
      
    chrome.storage.local.set({ 'arregloColas': result.arregloColas}, function() {
      console.log('Array actualizado');
      console.log(result.arregloColas)

      //comienza el funcionamiento de las colas tras actualizar
      if(result.arregloColas.length  === 0){
        console.log("no hay tags en la cola") 
      }else{
        colasWebService();
      }
    });
    
  });
}


//cola simulada
async function colasWebService(){
  chrome.storage.local.get('arregloColas', function(result) {
    console.log(result);

    if(result.arregloColas.length === 0){
       console.log("no hay tags en la cola") 
    }else{
       let primeraEtiqueta = result.arregloColas[0];
       console.log("voy a guardar esta etiqueta: ",primeraEtiqueta)
       setTimeout(() => {
        guardarEtiquetaWeb(primeraEtiqueta);
      }, 5000); 
    }
    
  });
}

function guardarEtiquetaWeb(etiqueta){

  let parts = etiqueta.split(',');

  console.log(parts);

  let id = parts[2];
  let tagDescripcion = parts[0];
  let tagTiempo = parts[1];

  if(etiqueta){
   let init = {
     method: 'PUT',
     async: true,
     body: JSON.stringify({
      "url": `https://drive.google.com/file/d/${id}`,
      "artifactTag": tagDescripcion,
      "timestamp": tagTiempo
    })
     ,
     headers: {
       'Content-Type': 'application/json'
     }
   };
   fetch(
     "https://apivideotagger.borrego-research.com/webserviceontology/videotagger/videos/tag",
       init)
     .then((response) => console.log(response))
     .then(function(data) {
         console.log(data);
         chrome.storage.local.get('arregloColas', function(result) {

          result.arregloColas.shift();
    
          chrome.storage.local.set({ 'arregloColas': result.arregloColas}, function() {
            console.log('Array actualizado');
            console.log(result.arregloColas)
      
            //comienza el funcionamiento de las colas tras actualizar
            if(result.arregloColas.length === 0){
              console.log("no hay tags en la cola") 
            }else{
              colasWebService();
            }
          });

          
        });
     }).catch((error) => {
      console.error("Ha fallado la consulta de cambio de permisos con el sig error");
      console.error(error);
      console.error("Se reintentara el guardado dentro de 10 segundos")
      colasWebService();
     });
  }
}