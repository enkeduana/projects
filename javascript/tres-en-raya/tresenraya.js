
//-----------------------------------------------------------------------------
//  DECLARACIÓN DE VARIABLES Y CONSTANTES
//-----------------------------------------------------------------------------

const divs = document.getElementsByTagName('div');

let turno = 'X';
let tableroVacio = true;
let puntosX = 0;
let puntosO = 0;
let ganador = '';
let tenemosGanador;
let vacio;


//-----------------------------------------------------------------------------
//  INICIALIZACIÓN
//-----------------------------------------------------------------------------

//Al detectar el evento click sobre una celda (div) pone en marcha el juego.
for (let div of divs) {
    
    div.addEventListener('click', (event) => {
        
        const clickedDiv = event.target; 
        
        marcar(clickedDiv);
        verificarJugada();
        estaVacioElTablero();
        
        //Si el tablero se llena sin un ganador se considera empate y se reinicia.
        if (tenemosGanador == false &&
            vacio == false){

            alert("Empate. Reiniciando el tablero...");
            setTimeout(vaciarTablero, 2000);

        }

        cambiarTurno();
        
    });
}


//-----------------------------------------------------------------------------
//  FUNCIONES
//-----------------------------------------------------------------------------


/**
 * Comprueba si el elemento está vacío. Si es así, lo marca el String que se encuentre
 * almacenado en la variable turno en ese momento.
 * @param {*} elemento 
 */
function marcar(elemento) {

    if(elemento.innerHTML === ''){

        elemento.innerHTML = turno;
    }

}


/**
 * Si el turno es 'X' pasa a 'O' y veciversa.
 */
function cambiarTurno() {

    if (turno == 'X'){
        turno = 'O';
    } else {
        turno = 'X';
    }
}

/**
 * Es función comprueba si una celda está vacía, y si no es así compara el contenido 
 * de las celdas siguiendo el patrón de las ocho posibles combinaciones ganadoras. Si
 * haya una combinación ganadora presente en el tablero llama a la función ganadorEncontrado(),
 * y devuelve true.
 * @returns tenemosGanador (true/false)
 */
function verificarJugada(){

    tenemosGanador = false;

    let c1 = document.getElementById('c1');
    let c2 = document.getElementById('c2');
    let c3 = document.getElementById('c3');
    let c4 = document.getElementById('c4');
    let c5 = document.getElementById('c5');
    let c6 = document.getElementById('c6');
    let c7 = document.getElementById('c7');
    let c8 = document.getElementById('c8');
    let c9 = document.getElementById('c9');

    if( c1.innerHTML != '' &&
        c1.innerHTML === c2.innerHTML && 
        c1.innerHTML === c3.innerHTML){

        ganador = c1.innerHTML;
        tenemosGanador = true;
        ganadorEncontrado(c1, c2, c3);
    
    }

    if( c4.innerHTML != '' &&
        c4.innerHTML === c5.innerHTML && 
        c4.innerHTML === c6.innerHTML){

        ganador = c4.innerHTML;
        tenemosGanador = true;
        ganadorEncontrado(c4, c5, c6);
    
    }

    if( c7.innerHTML != '' &&
        c7.innerHTML === c8.innerHTML && 
        c7.innerHTML === c9.innerHTML){

        ganador = c7.innerHTML;
        tenemosGanador = true;
        ganadorEncontrado(c7, c8, c9);
    
    }

    if( c1.innerHTML != '' &&
        c1.innerHTML === c4.innerHTML && 
        c1.innerHTML === c7.innerHTML){

        ganador = c1.innerHTML;
        tenemosGanador = true;
        ganadorEncontrado(c1, c4, c7);
    
    }


    if( c2.innerHTML != '' &&
        c2.innerHTML === c5.innerHTML && 
        c2.innerHTML === c8.innerHTML){

        ganador = c2.innerHTML;
        tenemosGanador = true;
        ganadorEncontrado(c2, c5, c8);
    
    }


    if( c3.innerHTML != '' &&
        c3.innerHTML === c6.innerHTML && 
        c3.innerHTML === c9.innerHTML){

        ganador = c3.innerHTML;
        tenemosGanador = true;
        ganadorEncontrado(c3, c6, c9);
    
    }

    if( c1.innerHTML != '' &&
        c1.innerHTML === c5.innerHTML && 
        c1.innerHTML === c9.innerHTML){

        ganador = c1.innerHTML;
        tenemosGanador = true;
        ganadorEncontrado(c1, c5, c9);
    
    }

    if( c3.innerHTML != '' &&
        c3.innerHTML === c5.innerHTML && 
        c3.innerHTML === c7.innerHTML){

        ganador = c3.innerHTML;
        tenemosGanador = true;
        ganadorEncontrado(c3, c5, c7);
    
    }

    
    return tenemosGanador;

}



/**
 * Genera el mensaje que anuncia el ganador, después marca las tres celdas correspondientes
 * cambiando el color de su fondo, de blanco a azul. A continuación llama a la función
 * actualizarMarcador(), y después espera dos segundos antes de llamar a la función
 * vaciarTablero().
 * @param {*} celdaA 
 * @param {*} celdaB 
 * @param {*} celdaC 
 */
function ganadorEncontrado(celdaA, celdaB, celdaC){

    alert("Ha ganado: " + celdaA.innerHTML);
    
    celdaA.style.backgroundColor = '#6CB4EE';
    celdaB.style.backgroundColor = '#6CB4EE';
    celdaC.style.backgroundColor = '#6CB4EE';
    
    actualizarMarcador(celdaA.innerHTML);  
    setTimeout(vaciarTablero, 2000);
}


/**
 * Recorre las celdas, las vacía y pasa su color de fondo a blanco. Para que se reinicie
 * la partida el turno vuelve a ser 'X'
 */
function vaciarTablero(){

    for (let div of divs){
        div.innerHTML = '';
        div.style.backgroundColor = '#ffffff'
    }

    turno = 'X'
}

/**
 * Recorre las celdas (divs).
 * Devuelve true, si en el tablero hay al menos una celda vacia.
 * Devuelve false, si todo el tablero está completo.
 * @returns vacio (true/false)
 */
function estaVacioElTablero(){

    vacio = false;

    for(let div of divs)
    {
        if(div.innerHTML == '')
        {
            vacio = true;
        } 
    }
    return vacio;
}

/**
 * Usaremos esta función para detectar que marcador debe sumar 1 tras ganar una partida.
 * El elemento que recibirá por parámetro será el contenido de una celda de la combinación
 * ganadora. Suma un punto al marcador 'X' u 'O', según el contenido de la celda.
 * @param {*} elemento 
 */
function actualizarMarcador(elemento){

    if(elemento == 'X'){

        puntosX++;
        document.getElementById('puntosX').innerText = puntosX;
        console.log("entre en el bucle que no era");


    } else {

        puntosO++;
        document.getElementById('puntosO').innerText = puntosO;
    }

}