
/* ============================================
   OBRAS.JS
   /Users/usuario/Documents/Web Albarracín para ajustes 5:06:2026/assets/img/producto-1-color-1
   Administración dinámica de las obras
============================================ */

const obras = {

    "prisma-cedro-1":{

        artista:"Christian Albarracín",

        titulo:"ART-1",

        categoria:"COLOR",

        precio:"$ 00.000.00",

        descripcion:"Descripción de la obra.",
            colores:[

            {
                 id: 1,
                nombre:"Cedro",

                color:"#9A6B3F",

                imagenes:[
                    "assets/img/producto-1-color-1/portada.jpg",
                    "assets/img/producto-1-color-1/1.jpg",
                    "assets/img/producto-1-color-1/2.jpg",
                    "assets/img/producto-1-color-1/3.jpg"
                ],

                video:"assets/img/producto-1-color-1/video.mp4",

                disponibilidad:{
                    "50":[false],
                   
                }

            },

            {
                 id: 2,
                nombre:"Negro",

                color:"#111111",

                imagenes:[
                    "assets/img/producto-1-color-2/portada.jpg",
                    "assets/img/producto-1-color-2/1.jpg",
                    "assets/img/producto-1-color-2/2.jpg",
                    "assets/img/producto-1-color-2/3.jpg"
                ],

                video:"assets/img/producto-1-color-2/video.mp4",

                disponibilidad:{
                    "50":[true],
                }

            }

            ],


        imagenes:[
            "assets/img/producto-1-color-1/portada.jpg",
            "assets/img/producto-1-color-1/1.jpg",
            "assets/img/producto-1-color-1/2.jpg",
            "assets/img/producto-1-color-1/3.jpg",
            "assets/img/producto-1-color-1/4.jpg"
        ],

        video:"assets/img/producto-1-color-1/video.mp4"

    },

    "prisma-cedro-2":{

        artista:"Christian Albarracín",

        titulo:"ART-2",

        categoria:"COLOR",

        precio:"$ 00.000.00",

        descripcion:"Descripción de la obra.",

        colores:[
{
    id: 1,
    nombre:"Cedro",
    color:"#9A6B3F",

    disponibilidad:{

        "50":[
            true,
        ],

    }

},{
    id: 2,
    nombre:"Verde",
    color:"#074716",

    disponibilidad:{

        "50":[
            false,
        ],

       

    }

},{
    id: 2,
    nombre:"Verde",
    color:"#074716",

    disponibilidad:{

        "50":[
            true,
        ],

       

    }

}
],


        imagenes:[
            "assets/img/producto-1-color-2/portada.jpg",
            "assets/img/producto-1-color-2/1.jpg",
            "assets/img/producto-1-color-2/2.jpg",
            "assets/img/producto-1-color-2/3.jpg"
        ],

        video:"assets/img/producto-1-color-2/video.mp4"

    },

     "prisma-cedro-3":{

        artista:"Christian Albarracín",

        titulo:"ART-3",

        categoria:"COLOR",

        precio:"$ 00.000.00",

        descripcion:"Descripción de la obra.",
        colores:[
{
     id: 1,
    nombre:"Cedro",
    color:"#9A6B3F",

    disponibilidad:{

        "50":[
            true,
          
        ],

        

    }

},
{
     id: 1,
    nombre:"Azul",
    color:"#1b0871",

    disponibilidad:{

        "50":[
            false,
        ],

       

    }

}
],


        imagenes:[
            "assets/img/producto-3-color-1/portada.jpg",
            "assets/img/producto-3-color-1/1.jpg",
            "assets/img/producto-3-color-1/2.jpg",
            "assets/img/producto-3-color-1/3.jpg"
        ],

        video:"assets/img/producto-3-color-1/video.mp4"


    }

};


/* ============================================
   REFERENCIAS DEL DETALLE
============================================ */

const detalle = document.getElementById("obra-detalle");

const viewer = document.getElementById("viewer");

const thumbGrid = document.querySelector(".thumb-grid");

const artista = detalle.querySelector(".artista");

const titulo = detalle.querySelector("h2");

const categoria = detalle.querySelector(".categoria");

const precio = detalle.querySelector(".precio");



/* ============================================
   CAMBIAR VISOR
============================================ */

function cambiarViewer(tipo,src){

    if(tipo==="image"){

        viewer.innerHTML=`<img src="${src}" alt="">`;

    }

    if(tipo==="video"){

        viewer.innerHTML=`
            <video controls autoplay muted playsinline>
                <source src="${src}" type="video/mp4">
            </video>
        `;

    }

}



/* ============================================
   GENERAR MINIATURAS
============================================ */

function crearMiniaturas(obra){

    thumbGrid.innerHTML="";

    obra.imagenes.forEach((imagen,index)=>{

        const thumb=document.createElement("button");

        thumb.className="thumb";

        if(index===0){

            thumb.classList.add("active");

        }

        thumb.innerHTML=`
            <img src="${imagen}" alt="">
        `;

        thumb.addEventListener("click",()=>{

            cambiarViewer("image",imagen);

            document.querySelectorAll(".thumb").forEach(t=>{

                t.classList.remove("active");

            });

            thumb.classList.add("active");

        });

        thumbGrid.appendChild(thumb);

    });


    if(obra.video){

        const video=document.createElement("button");

        video.className="thumb";

        video.innerHTML=`

            <video muted>

                <source src="${obra.video}" type="video/mp4">

            </video>

            <span class="play">▶</span>

        `;

        video.addEventListener("click",()=>{

            cambiarViewer("video",obra.video);

            document.querySelectorAll(".thumb").forEach(t=>{

                t.classList.remove("active");

            });

            video.classList.add("active");

        });

        thumbGrid.appendChild(video);

    }

}



/* ============================================
   CARGAR OBRA
============================================ */

// function cargarObra(id){

//     const obra = obras[id];

//     if(!obra) return;

//     artista.textContent = obra.artista;

//     titulo.textContent = obra.titulo;

//     categoria.textContent = obra.categoria;

//     precio.textContent = obra.precio;

//     cargarGaleria(obra);

// }


/* ============================================
   EVENTOS
============================================ */
// function cargarObra(id){

//     const obra = obras[id];

//     if(!obra) return;

//     artista.textContent = obra.artista;
//     titulo.textContent = obra.titulo;
//     categoria.textContent = obra.categoria;
//     precio.textContent = obra.precio;

//     // Mostrar imagen principal
//     cambiarViewer("image", obra.imagenes[0]);

//     // Crear miniaturas
//     crearMiniaturas(obra);

// }

function cargarObra(id){

    const obra = obras[id];

    if(!obra) return;

    artista.textContent = obra.artista;
    titulo.textContent = obra.titulo;
    categoria.textContent = obra.categoria;
    precio.textContent = obra.precio;

    cambiarViewer("image", obra.imagenes[0]);

    crearMiniaturas(obra);

    cargarColores(obra);

    if(obra.colores.length){

        mostrarGuia(obra.colores[0].disponibilidad);

    }

}


const colorSelector =
document.getElementById("colorSelector");

// function cargarColores(obra){

//     colorSelector.innerHTML="";

//     obra.colores.forEach(color=>{

//         const btn=document.createElement("button");

//         btn.className="color-btn";

//         btn.style.background=color.color;

//         btn.title=color.nombre;

//         btn.onclick=()=>{

//             mostrarGuia(color.guia);

//         };

//         colorSelector.appendChild(btn);

//     });

// }


function cargarColores(obra){

    colorSelector.innerHTML="";

    obra.colores.forEach((color, index) => {

        const btn = document.createElement("button");
        btn.className = "color-btn";
        btn.style.background = color.color;
        btn.title = color.nombre;

        const num = document.createElement("span");
        num.className = "color-num";
        num.textContent = color.id;
        btn.appendChild(num);

        const disponible = Object.values(color.disponibilidad)
            .some(arr => arr.some(v => v === true));

        if(!disponible){
            btn.classList.add("agotado");
            btn.disabled = true;
        }

    
       btn.addEventListener("click", () => {

    document.querySelectorAll(".color-btn")
        .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    mostrarGuia(color.disponibilidad);

    const btnCart = document.getElementById("addToCart");
    btnCart.disabled = false;
    btnCart.textContent = "AGREGAR AL CARRITO";

});

        colorSelector.appendChild(btn);
    });
}
document.querySelectorAll(".obra-item").forEach(item=>{

    item.addEventListener("click",()=>{

      const id = item.dataset.id;
const obra = obras[id];

cargarObra(id);
// cargarColores(obra);
// mostrarGuia(color);



//         detalle.scrollIntoView({

//             behavior:"smooth"

//         });


detalle.classList.add("active");

detalle.scrollIntoView({

    behavior:"smooth"

});

    });

});