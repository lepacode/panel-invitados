(function () {
    "use strict";

    var fab = document.querySelector(".fab");
    var threshold = 300;

    function toggleFab() {
        if (window.scrollY > threshold) {
            fab.classList.add("fab_visible");
        } else {
            fab.classList.remove("fab_visible");
        }
    }

    window.addEventListener("scroll", toggleFab, { passive: true });
    toggleFab();

    fab.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.querySelectorAll(".card__link").forEach(function (link) {
        link.addEventListener("click", function (event) {
            var destino = link.getAttribute("href");
            if (!destino || destino === "#") {
                event.preventDefault();
            }
        });
    });

    var btnDescargar = document.getElementById("descargar_pdf");

    btnDescargar.addEventListener("click", function () {
        var invitados = window.DATOS_EVENTO.invitados;
        var playlist = window.DATOS_EVENTO.playlist;

        window.stylesPDF.generarPDF(invitados, playlist);
    });
})();
