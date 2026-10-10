(function () {
    "use strict";

    var invitados = window.DATOS_EVENTO.invitados;

    var lista = document.getElementById("lista");
    var vacio = document.getElementById("lista_vacio");
    var buscador = document.getElementById("buscador");
    var lightbox = document.getElementById("lightbox");
    var lightboxTexto = document.getElementById("lightbox_texto");
    var exito = document.getElementById("exito");
    var exitoTimer = null;
    var pendiente = null;

    var personas = [];
    invitados.forEach(function (inv) {
        inv.miembros.forEach(function (miembro) {
            if (miembro.estado !== "confirmado") {
                return;
            }
            personas.push({ nombre: miembro.nombre, mesa: inv.mesa, ref: miembro });
        });
    });

    function escapar(texto) {
        var div = document.createElement("div");
        div.textContent = texto == null ? "" : texto;
        return div.innerHTML;
    }

    function numeroMesa(mesa) {
        return parseInt(mesa.replace(/\D/g, ""), 10) || 0;
    }

    function actualizarStats() {
        var llegaron = personas.filter(function (p) {
            return p.ref.llego;
        }).length;

        document.getElementById("stat_llegaron").textContent = llegaron;
        document.getElementById("stat_faltan").textContent = personas.length - llegaron;
    }

    function render() {
        var query = buscador.value.trim().toLowerCase();
        var grupos = {};

        personas.forEach(function (p, i) {
            var coincideNombre = p.nombre.toLowerCase().indexOf(query) !== -1;
            var coincideMesa = p.mesa.toLowerCase().indexOf(query) !== -1;
            if (query && !coincideNombre && !coincideMesa) {
                return;
            }
            if (!grupos[p.mesa]) {
                grupos[p.mesa] = [];
            }
            grupos[p.mesa].push({ persona: p, indice: i });
        });

        var mesas = Object.keys(grupos).sort(function (a, b) {
            return numeroMesa(a) - numeroMesa(b);
        });

        lista.innerHTML = mesas.map(function (mesa, gi) {
            var filas = grupos[mesa].map(function (item) {
                var p = item.persona;
                var boton = p.ref.llego
                    ? '<button class="fila__btn fila__btn_ok" type="button">Llegó</button>'
                    : '<button class="fila__btn" type="button" data_persona="' + item.indice + '">Check-in</button>';

                return '<div class="fila">' +
                    '<span class="fila__nombre">' + escapar(p.nombre) + "</span>" +
                    boton +
                "</div>";
            }).join("");

            return '<div class="grupo" style="animation-delay:' + (gi * 0.05) + 's">' +
                '<div class="grupo__titulo">' + escapar(mesa) + "</div>" +
                filas +
            "</div>";
        }).join("");

        vacio.hidden = mesas.length > 0;
        actualizarStats();
    }

    function mostrarExito() {
        clearTimeout(exitoTimer);
        exito.classList.add("exito_visible");
        exito.setAttribute("aria-hidden", "false");
        exitoTimer = setTimeout(function () {
            exito.classList.remove("exito_visible");
            exito.setAttribute("aria-hidden", "true");
        }, 1500);
    }

    function abrirConfirmacion(indice) {
        pendiente = personas[indice];
        document.getElementById("lightbox_mesa").textContent = pendiente.mesa;
        lightboxTexto.textContent = "¿Confirmás el check-in de " + pendiente.nombre + "?";
        lightbox.classList.add("lightbox_visible");
        lightbox.setAttribute("aria-hidden", "false");
    }

    function cerrarConfirmacion() {
        lightbox.classList.remove("lightbox_visible");
        lightbox.setAttribute("aria-hidden", "true");
        pendiente = null;
    }

    lista.addEventListener("click", function (event) {
        var btn = event.target.closest("[data_persona]");
        if (!btn) {
            return;
        }
        abrirConfirmacion(parseInt(btn.getAttribute("data_persona"), 10));
    });

    document.getElementById("confirmar").addEventListener("click", function () {
        if (!pendiente) {
            return;
        }
        pendiente.ref.llego = true;
        cerrarConfirmacion();
        render();
        mostrarExito();
    });

    lightbox.querySelector(".lightbox__cerrar").addEventListener("click", cerrarConfirmacion);
    lightbox.querySelector("[data_cancelar]").addEventListener("click", cerrarConfirmacion);

    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) {
            cerrarConfirmacion();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && lightbox.classList.contains("lightbox_visible")) {
            cerrarConfirmacion();
        }
    });

    buscador.addEventListener("input", render);

    document.getElementById("actualizar").addEventListener("click", render);

    render();
})();
