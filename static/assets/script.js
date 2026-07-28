// =========================
// GSAP
// =========================

gsap.registerPlugin(ScrollTrigger);

// =========================
// LOADER + HERO ANIMATION
// =========================

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    const nav = document.getElementById("mainNav");
    const loaderVideo = document.querySelector("#loader video");

    if(sessionStorage.getItem("loaderShown")){
        if(loader) loader.style.display = "none";
        if(nav) nav.classList.add("nav-visible");
        return;
    }

    sessionStorage.setItem("loaderShown", "true");

    function hideLoader(){
        if(loader) loader.classList.add("loader-hide");
        
        const tl = gsap.timeline();
        tl.to(".hero-sculpture",{ opacity:1, scale:1, duration:1.8, ease:"power3.out" })
        .to(".hero-counter",{ opacity:1, x:0, duration:.8 },"-=1.2")
        .to(".hero-description",{ opacity:1, y:0, duration:1 },"-=0.7")
        .to(".navbar",{ opacity:1, y:0, duration:.8 },"-=0.3");

        setTimeout(() => {
            if(nav) nav.classList.add("nav-visible");
        }, 60);
    }

    if(loaderVideo){
        loaderVideo.addEventListener("ended", hideLoader);
        setTimeout(hideLoader, 10000);
    } else {
        setTimeout(hideLoader, 2500);
    }
});

window.addEventListener("pageshow", (event) => {
    if(event.persisted || sessionStorage.getItem("loaderShown")){
        const loader = document.getElementById("loader");
        const nav = document.getElementById("mainNav");
        if(loader) loader.style.display = "none";
        if(nav) nav.classList.add("nav-visible");
    }
});

// // =========================
// // NAVBAR SCROLL
// // =========================
// if(window.innerWidth>=1050){
//     if(document.getElementById("hero")){
//         ScrollTrigger.create({
//             trigger: "#hero",
//             start: "top top",
//             end: "80% top",
//             onLeave: () => {
//                 document.getElementById("mainNav").classList.add("nav-scrolled");
//                 document.getElementById("logoNav").src = "assets/img/logo-blanco.png";
//             },
//             onEnterBack: () => {
//                 document.getElementById("mainNav").classList.remove("nav-scrolled");
//                 document.getElementById("logoNav").src = "assets/img/Logo-negro.png";
//             }
//         })
//     }
// };





// ==========================================
// MENU
// ==========================================

const menuToggle = document.getElementById("menuToggle");
const navWrapper = document.getElementById("navWrapper");
const megaItem = document.querySelector(".has-mega");
const megaTrigger = document.querySelector(".mega-trigger");

// ---------- Mobile ----------

menuToggle.addEventListener("click", () => {

    navWrapper.classList.toggle("open");

});

// ---------- Mega menu ----------

megaTrigger.addEventListener("click", function(e){

    if(window.innerWidth <= 991){

        e.preventDefault();

        megaItem.classList.toggle("open");

    }

});

// ---------- Desktop ----------

if(window.innerWidth > 991){

    megaItem.addEventListener("mouseenter", ()=>{

        megaItem.classList.add("open");

    });

    megaItem.addEventListener("mouseleave", ()=>{

        megaItem.classList.remove("open");

    });

}

// ---------- Click fuera ----------

document.addEventListener("click",(e)=>{

    if(!megaItem.contains(e.target)){

        megaItem.classList.remove("open");

    }

});

// ---------- Resize ----------

window.addEventListener("resize",()=>{

    if(window.innerWidth>991){

        navWrapper.classList.remove("open");

    }

});
// =========================
// STATEMENT
// =========================

gsap.timeline({
    scrollTrigger:{ trigger:"#statement", start:"top 75%" }
})
.to(".statement-title",{ opacity:1, y:0, duration:1.2, ease:"power3.out" })
.to(".statement-line",{ width:"90px", opacity:1, duration:.8 },"-=0.5");

gsap.from(".statement-title span",{
    y:120, stagger:.12, duration:1.2, ease:"power4.out",
    scrollTrigger:{ trigger:"#statement", start:"top 70%" }
});

// =========================
// BIOGRAF�0�1A
// =========================

gsap.timeline({
    scrollTrigger:{ trigger:"#biografia", start:"top 70%" }
})
.to(".bio-title",{ opacity:1, y:0, duration:1.2, ease:"power3.out" })
.to(".bio-text p",{ opacity:1, y:0, stagger:.2, duration:1 },"-=0.8")
.to(".bio-image",{ opacity:1, x:0, scale:1, duration:1.4, ease:"power3.out" },"-=1");

// =========================
// SWIPER
// =========================

if(document.querySelector(".obrasSwiper")){
    new Swiper(".obrasSwiper",{
        slidesPerView:"auto",
        spaceBetween:30,
        speed:6000,
        loop:false,
        autoplay:{ delay:0, disableOnInteraction:false }
    });
}

// =========================
// OBRAS ANIMATION
// =========================

gsap.from(".obra-card",{
    opacity:0, y:60, stagger:.1, duration:.8, ease:"power2.out",
    scrollTrigger:{ trigger:"#obras", start:"top 80%" }
});

// =========================
// CTA ARTIST
// =========================

gsap.timeline({
    scrollTrigger:{ trigger:"#cta-artist", start:"top 85%" }
})
.to(".pattern-lines",{ scale:1, duration:1.5, ease:"power3.out" })
.to(".cta-title",{ opacity:1, y:0, duration:1.2 },"-=1")
.to(".cta-subtitle",{ opacity:1, y:0, duration:.8 },"-=.6");

// =========================
// NEWSLETTER / FOOTER
// =========================

gsap.timeline({
    scrollTrigger:{ trigger:"#newsletter-footer", start:"top 100%" }
})
.to(".newsletter-copy",{ opacity:1, y:0, duration:0.2 })
.to(".newsletter-form",{ opacity:1, y:0, duration:0.2 },"-=0.7")
.to(".footer-social",{ opacity:1, y:0, duration:.0 },"-=0.1")
.to(".footer-brand",{ opacity:1, y:0, duration:0.1 },"-=0.4")
.to(".footer-legal",{ opacity:1, y:0, duration:.3 },"-=0.3");

// =========================
// EXPOSICIONES
// =========================

gsap.utils.toArray(".expo-item").forEach((item) => {
    gsap.to(item,{
        opacity:1, y:0, duration:1, ease:"power3.out",
        scrollTrigger:{ trigger:item, start:"top 85%", once:true }
    });
});

gsap.fromTo(".expo-category",
    { opacity:0, x:-50 },
    { opacity:1, x:0, duration:1, scrollTrigger:{ trigger:"#exposiciones", start:"top 80%", once:true } }
);



// =========================
// RECONOCIMIENTOS
// =========================

document.addEventListener("DOMContentLoaded", () => {
    gsap.timeline({
        scrollTrigger:{ trigger:"#reconocimientos", start:"top bottom", once:true }
    })
    .to(".recognition-title",{ opacity:1, y:0, duration:1.2, ease:"power4.out" })
    .to(".recognition-item",{ opacity:1, y:0, stagger:.15, duration:1 },"-=0.8");
});
// =========================
// PROYECTO DESTACADO
// =========================

if(document.getElementById("proyecto-destacado")){
    gsap.timeline({
        scrollTrigger:{ trigger:"#proyecto-destacado", start:"top 70%", once:true }
    })
    .fromTo(".project-kicker",{ opacity:0, y:40 },{ opacity:1, y:0, duration:.8, ease:"power3.out" })
    .fromTo(".project-title span",{ opacity:0, y:120 },{ opacity:1, y:0, stagger:.12, duration:1, ease:"power4.out" },"-=0.3")
    .fromTo(".project-meta span",{ opacity:0, y:40 },{ opacity:1, y:0, stagger:.08, duration:.8 },"-=0.5");

    gsap.fromTo(".gallery-card",
        { opacity:0, y:120 },
        { opacity:1, y:0, stagger:.2, duration:1.2, ease:"power3.out",
          scrollTrigger:{ trigger:".gallery-row", start:"top 80%", once:true } }
    );

    gsap.fromTo(".gallery-overlay h3 span",
        { opacity:0, y:100, filter:"blur(10px)" },
        { opacity:1, y:0, filter:"blur(0px)", stagger:.08, duration:1, ease:"power4.out",
          scrollTrigger:{ trigger:".gallery-row", start:"top 80%", once:true } }
    );

    gsap.fromTo(".overlay-subtitle",
        { opacity:0, x:-30 },
        { opacity:1, x:0, duration:.8, ease:"power3.out",
          scrollTrigger:{ trigger:".gallery-row", start:"top 80%", once:true } }
    );
}

// =========================
// PRODUCTO / GALER�0�1A
// =========================

// const guide = document.getElementById("sizeGuide");
// if(guide){
//     document.getElementById("openGuide").addEventListener("click", (e) => {
//         e.stopPropagation();
//         guide.classList.toggle("active");
//         if(guide.classList.contains("active")){
//             guide.scrollIntoView({ behavior: "smooth", block: "start" });
//         }
//     });
//     document.getElementById("closeGuide").addEventListener("click", (e) => {
//         e.stopPropagation();
//         guide.classList.remove("active");
//     });
// }

// const viewer = document.getElementById('viewer');
// const thumbs = document.querySelectorAll('.thumb');
// if(viewer && thumbs.length){
//     thumbs.forEach(thumb => {
//         thumb.addEventListener('click', () => {
//             const type = thumb.dataset.type;
//             const src = thumb.dataset.src;
//             thumbs.forEach(item => item.classList.remove('active'));
//             thumb.classList.add('active');
//             if(type === 'image'){
//                 viewer.innerHTML = `<img src="${src}" alt="">`;
//             }
//             if(type === 'video'){
//                 viewer.innerHTML = `<video controls autoplay muted playsinline><source src="${src}" type="video/mp4"></video>`;
//             }
//         });
//     });
// }

// NOTE: opening/closing #sizeGuide is owned entirely by producto.js,
// which also renders the dynamic size/stock table inside it. This file
// used to attach its own duplicate click listener on #openGuide that
// toggled the same "active" class, causing the two toggles to cancel
// each other out on every click (confirmed via runtime logs).






// const viewer = document.getElementById("viewer");
// const thumbGrid = document.querySelector(".thumb-grid");

// function activarMiniatura(btn){

//     document.querySelectorAll(".thumb").forEach(t=>{

//         t.classList.remove("active");

//     });

//     btn.classList.add("active");

// }
// function mostrarImagen(src){

//     console.log(src);

//     viewer.innerHTML = `<img src="${src}" alt="">`;

// }

// function mostrarVideo(src){

//     viewer.innerHTML=`

//         <video controls autoplay muted playsinline>

//             <source src="${src}" type="video/mp4">

//         </video>

//     `;

// }

// function cargarGaleria(obra){

//     thumbGrid.innerHTML="";

//     // Imagen principal

//     mostrarImagen(obra.imagenes[0]);

//     obra.imagenes.forEach((img,index)=>{

//         const boton=document.createElement("button");

//         boton.className="thumb";

//         if(index===0){

//             boton.classList.add("active");

//         }

//         boton.innerHTML=`

//             <img src="${img}" alt="">

//         `;

//         boton.onclick=function(){

//             mostrarImagen(img);

//             activarMiniatura(boton);

//         };

//         thumbGrid.appendChild(boton);

//     });

//     if(obra.video){

//         const video=document.createElement("button");

//         video.className="thumb";

//         video.innerHTML=`

//             <video muted>

//                 <source src="${obra.video}" type="video/mp4">

//             </video>

//             <span class="play">▶</span>

//         `;

//         video.onclick=function(){

//             mostrarVideo(obra.video);

//             activarMiniatura(video);

//         };

//         thumbGrid.appendChild(video);

//     }

// }





// =========================
// CARRITO
// =========================

// const addToCart = document.getElementById('addToCart');
// const cartModal = document.getElementById('cartModal');
// if(addToCart && cartModal){
//     addToCart.addEventListener('click', () => {
//         cartModal.classList.add('active');
//     });
// }


const addToCart = document.getElementById("addToCart");
const cartOverlay = document.getElementById("cartOverlay");

if (addToCart && cartOverlay) {

    addToCart.addEventListener("click", () => {

        cartOverlay.classList.add("active");

    });

}

// const closeCart = document.getElementById('closeCart');
// if(closeCart){
//     closeCart.addEventListener('click', () => {
//         cartModal.classList.remove('active');
//     });
// }

const closeCart = document.getElementById("closeCart");

if (closeCart && cartOverlay) {

    closeCart.addEventListener("click", () => {

        cartOverlay.classList.remove("active");

    });

}

// document.addEventListener('click', (e) => {
//     if(e.target.id === 'addToCart'){
//         document.getElementById('cartOverlay').classList.add('active');
//     }
//     if(e.target.id === 'closeCart'){
//         document.getElementById('cartOverlay').classList.remove('active');
//     }
// });




