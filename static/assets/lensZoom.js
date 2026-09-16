document.addEventListener("DOMContentLoaded", function () {

    const viewer = document.getElementById("viewer");

    if (!viewer) return;


    /* ==========================================
       CONFIGURACIÓN
       ========================================== */

    const ZOOM = 2.5;


    /* ==========================================
       MOUSE MOVE
       ========================================== */

    viewer.addEventListener("mousemove", function (e) {

        const img = viewer.querySelector("img");

        if (!img) return;


        const rect = img.getBoundingClientRect();


        /*
         * Posición del mouse dentro de la imagen
         * convertida a porcentaje.
         */

        let x =
            ((e.clientX - rect.left) / rect.width) * 100;

        let y =
            ((e.clientY - rect.top) / rect.height) * 100;


        /*
         * Evitar valores fuera de la imagen
         */

        x = Math.max(0, Math.min(100, x));

        y = Math.max(0, Math.min(100, y));


        /*
         * El punto donde está el mouse
         * se convierte en el centro del zoom.
         */

        img.style.transformOrigin =
            `${x}% ${y}%`;


        /*
         * Ampliar imagen
         */

        img.style.transform =
            `scale(${ZOOM})`;

    });


    /* ==========================================
       SALIR DE LA IMAGEN
       ========================================== */

    viewer.addEventListener("mouseleave", function () {

        const img = viewer.querySelector("img");

        if (!img) return;


        img.style.transform =
            "scale(1)";

        img.style.transformOrigin =
            "50% 50%";

    });


    /* ==========================================
       CUANDO CAMBIA LA IMAGEN
       ========================================== */

    const observer =
        new MutationObserver(function () {

            const img =
                viewer.querySelector("img");

            if (!img) return;


            /*
             * Resetear cualquier zoom anterior
             */

            img.style.transform =
                "scale(1)";

            img.style.transformOrigin =
                "50% 50%";

        });


    observer.observe(viewer, {

        childList: true,

        subtree: true

    });

});