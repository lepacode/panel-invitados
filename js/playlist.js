(function () {
    "use strict";

    var recomendaciones = window.DATOS_EVENTO.playlist;

    var playlist = document.getElementById("playlist");

    function escapar(texto) {
        var div = document.createElement("div");
        div.textContent = texto;
        return div.innerHTML;
    }

    playlist.innerHTML = recomendaciones.map(function (rec, i) {
        return '<article class="cancion" style="animation-delay:' + (i * 0.05) + 's">' +
            '<div class="cancion__top">' +
                '<h2 class="cancion__nombre">' + escapar(rec.nombre) + "</h2>" +
                '<span class="cancion__recomendo">recomendó:</span>' +
            "</div>" +
            '<p class="cancion__detalle">- <span class="cancion__cancion">' + escapar(rec.cancion) + "</span>" +
            ' <span class="cancion__artista">- ' + escapar(rec.artista) + "</span></p>" +
        "</article>";
    }).join("");
})();
