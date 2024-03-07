importScripts('backgroundColas.js');
importScripts('backgroundBusqueda.js');
importScripts('backgroundPermisos.js');
importScripts('backgroundGuardar.js');

let tokenGuardar = "";

chrome.identity.getAuthToken({ interactive: true ,scopes: ['https://www.googleapis.com/auth/drive']}, function (token) {
   tokenGuardar = token;
   console.log("se creo token de api")
});

setTimeout(() => {
  colasBusquedaVideo();
  colasWebService();
  colasPermisos();
  colasGuardarVideo();
}, 10000);




//datos de la llamada
let nombreLlamada = "";
let fechaLlamada = "";
//intervalo para las consultas
let intervaloConsultas = null;
//intervalo del contador
let intervaloContador = null;
//token del usuario
//let tokenGuardar = "";
//popup
let popupWindow = null;
//tiempo acumulado del contador
let acumulado = 0;
let meetVentana = "";
/*
var dataToSave = {
  arregloEtiquetas: ["1","2"],
  someOtherData: 'value'
};

chrome.storage.local.set(dataToSave, function() {
  console.log('Data saved successfully');
});
*/

//linea de codigo para probar el guardado
//el video no se mostrar en la consulta de ver todos los videos de la ontologia
//si no tiene por lo menos una etiqueta

/*
arregloPrueba = ["primerprueba,00:00:01","segundoprueba,00:00:02"]
setTimeout(() => {
  guardarEtiquetasCola("1xc-c82laIn2gKTUQZaKKdUWHK7mmAyKt",arregloPrueba)
}, 5000);
*/

chrome.storage.local.get('llamadaActiva', function(result) {
  console.log("llamadaActiva",result.llamadaActiva);
  if (!result.llamadaActiva) {
    chrome.storage.local.set({ 'llamadaActiva': {nombreLlamada: "",fechaLlamada:"",etiquetas:[]} }, function() {
      console.log('Se creo un arreglo que almacenara los datos de la llamada en curso mientras se encuentre activa');
    });
  }else{
    
    if(result.llamadaActiva.nombreLlamada === ""){

    }else{
      console.log("se encontraron datos de una llamada anterior, se guardara el video");

      setTimeout(() => {
        guardarEnBusqueda(result.llamadaActiva.nombreLlamada,result.llamadaActiva.fechaLlamada,result.llamadaActiva.etiquetas);
      }, 15000);
      
      

      chrome.storage.local.set({ 'llamadaActiva': {nombreLlamada: "",fechaLlamada:"",etiquetas:[]} }, function() {
        console.log("se limpiaron los datos de la llamada anterior")
      });
    }
   
  }
});

/*
chrome.identity.getAuthToken({ interactive: true ,scopes: ['https://www.googleapis.com/auth/drive']}, function (token) {
   tokenGuardar = token;
   console.log(tokenGuardar);
});
*/

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'grabando') {


      chrome.storage.local.set({ 'arregloEtiquetas': [] }, function() {
        console.log('se limpio el array de etiquetas');
      });

      chrome.storage.local.get('llamadaActiva', function(result) {

        result.llamadaActiva.nombreLlamada = message.nombreLlamada;
        result.llamadaActiva.fechaLlamada = message.fechaLlamada;
        result.llamadaActiva.etiquetas = [];

        chrome.storage.local.set({ 'llamadaActiva': result.llamadaActiva }, function() {
          console.log('datos de la llamada actual actualizados');
          
        });
        
      });

      console.log(popupWindow)

      if (popupWindow) {
        console.log("la ventana ya esta activa");
        iniciarContador();
      } else {
        crearVentana();
        iniciarContador();
      }
  }

  if (message.action === "detenido"){
    detenerContador();

    //obtiene el arreglo de etiquetas
    chrome.storage.local.get('llamadaActiva', function(result) {

      console.log("imprimiendo en grabacion finalizada: ",result)

      //envia el arreglo a la consulta esperando el id para ser enviado a colas
      
      guardarEnBusqueda(result.llamadaActiva.nombreLlamada,result.llamadaActiva.fechaLlamada,result.llamadaActiva.etiquetas);
      /*
      intervaloConsultas = setInterval(function() {
        consultarApi(result.arregloEtiquetas);
      }, 300000);
      */
       //limpia el arreglo de etiquetas en caso de que se realice otra grabacion
       chrome.storage.local.set({ 'llamadaActiva': {nombreLlamada: "",fechaLlamada:"",etiquetas:[]} }, function() {
        console.log('Se limpio la informacion de la llamada activa');
       });
    });
  }

  if (message.action === "meetCerrado"){
    detenerContador();
      
     chrome.storage.local.get('llamadaActiva', function(result) {
        if(result.llamadaActiva.nombreLlamada !== ""){
          guardarEnBusqueda(result.llamadaActiva.nombreLlamada,result.llamadaActiva.fechaLlamada,result.llamadaActiva.etiquetas);

          chrome.storage.local.set({ 'llamadaActiva': {nombreLlamada: "",fechaLlamada:"",etiquetas:[]} }, function() {
            console.log('Se limpio la informacion de la llamada activa');
          });
        }
 
    });
  } 
  //1xc-c82laIn2gKTUQZaKKdUWHK7mmAyKt
});

function crearVentana(){
  chrome.windows.create({
    url: 'popup.html',
    type: 'popup'
  }, function(ventana) {  
    popupWindow = ventana;
    console.log(ventana);  
    removedListen(popupWindow.id);
  });  
}

function iniciarContador(){
  acumulado = 0; 

  intervaloContador = setInterval(() => {

    acumulado += 1000 ;
    
    chrome.runtime.sendMessage({ action: 'actualizarContador',tiempo: acumulado });
  
  }, 1000 / 60);
}

//error debido a que el intervalo sigue enviando actualizar aunque haya terminado
function detenerContador(){
   clearInterval(intervaloContador);
   acumulado = 0;
   chrome.runtime.sendMessage({action: 'actualizarContador',tiempo: acumulado})
}

function removedListen(id){
  chrome.windows.onRemoved.addListener(function(id) {
    if (popupWindow && id === popupWindow.id) {
        console.log('La ventana popup se ha cerrado.');
        popupWindow = null;

        if(acumulado !== 0){
          crearVentana();
        }
    }
  });
}

//metodo anterior
/*
function consultarApi(arregloEtq){
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

          arreglo.forEach(element => {
            console.log('id: ',element.id, " nombre: ",element.name);
             if(element.name.includes(fechaLlamada) &&  element.name.includes(nombreLlamada)){
               console.log("se encontro la llamada");
               console.log("id: ",element.id);
               console.log("name: ",element.name);
               clearInterval(intervaloConsultas);
               cambiarPermisos(element.id,arregloEtq);
             }else{
              console.log("todavia no se encuentra el id..")
             }
          });
      });
}

function cambiarPermisos(id,arregloEtq){
  if(id){
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
     `https://www.googleapis.com/drive/v3/files/${id}/permissions`,
       init)
     .then((response) => response.json())
     .then(function(data) {
         console.log(data);
         guardarVideo(id,arregloEtq);
     });
  }
}

function guardarVideo(id,arregloEtq){
  if(id){
   let init = {
     method: 'POST',
     async: true,
     body: JSON.stringify({
      "artifactName": nombreLlamada,
      "artifactLocation": `https://drive.google.com/file/d/${id}`,
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
         guardarEtiquetasCola(id,arregloEtq);
     });
  }
}

function guardarEtiquetasCola(id,arregloEtq){
  guardarEnCola(id,arregloEtq);
}
*/

