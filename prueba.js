//Clase de las colas
class Queue{

    #items = [];
  
    enqueue(item){
      this.#items.push(item)
    }
  
    dequeue(){
      return this.#items.shift()
    }
  
    isEmpty(){
      return this.#items.length === 0;
    }
  
  }
  
  function guardarEtiqueta(tiempo,etiqueta){
    return()=>{
      return new Promise((res,rej)=>{
        setTimeout(()=>{
          res(etiqueta)
        },tiempo)
      })
  
    }
  }
  
  const queue = new Queue();
  //Aqui iria la etiqueta
  queue.enqueue(guardarEtiqueta(3000, "etiqueta de prueba1"))
  queue.enqueue(guardarEtiqueta(3000, "etiqueta de prueba2"))
  
  async function run(){
  
    while(!queue.isEmpty()){
      const fn = queue.dequeue();
      const data = await fn;
      console.log(data);
    }
  
  }