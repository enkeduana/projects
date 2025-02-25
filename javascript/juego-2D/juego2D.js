
//-----------------------------------------------------------------------------
//  DECLARACIÓN DE CONSTANTES Y VARIABLES
//-----------------------------------------------------------------------------

const FICHA = document.getElementById('ficha');
const SUBIR = document.getElementById('subir');
const BAJAR = document.getElementById('bajar'); 
const DIFICULTAD = document.getElementById('dificultad');
const TEMPORIZADOR = document.getElementById('temporizador');

let ejeX;
let ejeY;
let tiempo = 20;
let puntos = 0;

//-----------------------------------------------------------------------------
//  INICIALIZACIÓN
//-----------------------------------------------------------------------------

//La funcion se se ejecuta cada 0.7 segundos
setInterval(cambiarUbicacion, 700);

//La función se ejecuta cada 1 segundo.
setInterval(cuentaAtras, 1000);

//Si se hace click sobre la ficha se ejecuta la función.
FICHA.addEventListener('click', fichaClick);

//Si se hace click en los botones se ejecutan las funciones.
SUBIR.addEventListener('click', subirDificultad);
BAJAR.addEventListener('click', bajarDificultad);

//-----------------------------------------------------------------------------
//  FUNCIONES
//-----------------------------------------------------------------------------

/**
 * Genera números aleatorios y controla que estos se ajusten a la medida del
 * tablero. Tanto este como la ficha tienen la propiedad CSS position: relative;
 * De esta forma las coordenadas en el interior del tablero de simplifican 
 * (0 - 500), sin tener en cuenta su ubicación en la página. Para cada eje 
 * restamos la anchura y altura de la ficha, para que esta no traspase los límites.
 */
function cambiarUbicacion(){


    ejeX = Math.floor(Math.random() * (500 - FICHA.offsetWidth));
    ejeY = Math.floor(Math.random() * (500 - FICHA.offsetHeight));        
        
    FICHA.style.top = ejeY + 'px';
    FICHA.style.left = ejeX + 'px';
}


/**
 * Pone en funcionamiento el temporizador, que comienza en 20, e impide que llegue 
 * a números negativos. Si llega a cero se para.
 */
function cuentaAtras(){

    if (tiempo > 0){

        tiempo--;
        TEMPORIZADOR.innerHTML = tiempo; 
    }
}


/**
 * Suma la cifra presente en el temporizador (variable tiempo), a los puntos del
 * marcador. Después reinicia el temporizador a 20. Por último ejecuta la 
 * función subirDificultad().
 */
function fichaClick() {

    puntos = puntos + tiempo;
    marcador.innerHTML = puntos;

    tiempo = 20;
    TEMPORIZADOR.innerHTML = tiempo;

    subirDificultad();

}


/**
 * Disminuye el tamaño de la ficha en 20px, de anchura y altura, si esta es mayor
 * que su tamaño mínimo. Esto impide que se reduzca de manera continua. Dependiendo
 * del nuevo tamaño cambiará el nivel de dificultad indicado en la pantalla,
 * y el color de la ficha.
 *      
 *      NIVEL       |   COLOR       |   TAMAÑO
 *   ---------------------------------------------
 *      difícil     |   rojo        |   30x30px
 *      normal      |   amarillo    |   50x50px
 *      fácil       |   verde       |   70x70px
 *      
 */
function subirDificultad() {

    let anchuraFicha = FICHA.offsetWidth;
    let alturaFicha = FICHA.offsetHeight;
    
    if (anchuraFicha > 30 && alturaFicha > 30){

        FICHA.style.width = (anchuraFicha - 20) + 'px';
        FICHA.style.height = (alturaFicha - 20) + 'px';


        if(FICHA.offsetWidth == 50){

            DIFICULTAD.innerHTML = "normal";
            FICHA.style.backgroundColor = "#F3C969";

        } else {

            DIFICULTAD.innerHTML = "difícil";
            FICHA.style.backgroundColor = "#E63B2E";

        }

    }

}



/**
 * Aumenta el tamaño de la ficha en 20px, de anchura y altura, si esta es menor
 * que su tamaño máximo. Esto impide que se reduzca de manera continua. Dependiendo
 * del nuevo tamaño cambiará el nivel de dificultad indicado en la pantalla,
 * y el color de la ficha.
 * 
 *      NIVEL       |   COLOR       |   TAMAÑO
 *   ---------------------------------------------
 *      difícil     |   rojo        |   30x30px
 *      normal      |   amarillo    |   50x50px
 *      fácil       |   verde       |   70x70px
 */
function bajarDificultad() {

    let anchuraFicha = FICHA.offsetWidth;
    let alturaFicha = FICHA.offsetHeight;
    
    if(anchuraFicha < 70 && alturaFicha < 70){

        FICHA.style.width = (anchuraFicha + 20) + 'px';
        FICHA.style.height = (alturaFicha + 20) + 'px';

        if(FICHA.offsetWidth == 50){

            DIFICULTAD.innerHTML = "normal";
            FICHA.style.backgroundColor = "#F3C969";

        } else {

            DIFICULTAD.innerHTML = "fácil";
            FICHA.style.backgroundColor = "#4AAD52"

        }
        
    }

}