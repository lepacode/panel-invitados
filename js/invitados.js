(function () {
    "use strict";

    var invitados = window.DATOS_EVENTO.invitados;

    var lista = document.getElementById("lista");
    var vacio = document.getElementById("lista_vacio");
    var buscador = document.getElementById("buscador");
    var categorias = document.querySelectorAll(".categoria");
    var filtroActual = "todos";

    var etiquetas = {
        confirmado: "Confirmado",
        no_asiste: "No asiste",
        sin_confirmar: "Sin confirmar",
        pendiente: "Pendiente"
    };

    var restriccionesInfo = [
        { clave: "celiaco", etiqueta: "Celíacos" },
        { clave: "vegano", etiqueta: "Veganos" },
        { clave: "vegetariano", etiqueta: "Vegetarianos" }
    ];

    var etiquetaRestriccion = {
        celiaco: "celíaco",
        vegano: "vegano",
        vegetariano: "vegetariano"
    };

    var filtroRestriccion = null;

    function contarRestriccion(clave) {
        return invitados.reduce(function (acc, inv) {
            return acc + inv.miembros.filter(function (m) {
                return m.restriccion === clave;
            }).length;
        }, 0);
    }

    function renderRestricciones() {
        document.getElementById("restricciones").innerHTML = restriccionesInfo.map(function (r, i) {
            var activa = filtroRestriccion === r.clave ? " restriccion_activa" : "";
            var sep = i < restriccionesInfo.length - 1 ? '<span class="restricciones__sep">/</span>' : "";
            return '<button class="restriccion' + activa + '" type="button" data_restriccion="' + r.clave + '">' +
                r.etiqueta + ': <span class="restriccion__num">' + contarRestriccion(r.clave) + "</span>" +
                "</button>" + sep;
        }).join("");
    }

    function escapar(texto) {
        var div = document.createElement("div");
        div.textContent = texto;
        return div.innerHTML;
    }

    function render() {
        var query = buscador.value.trim().toLowerCase();

        var hayFiltroPlano = filtroRestriccion || filtroActual !== "todos";
        if (hayFiltroPlano) {
            renderListaPlana(query, function (m) {
                var okEstado = filtroActual === "todos" || m.estado === filtroActual;
                var okRestriccion = !filtroRestriccion || m.restriccion === filtroRestriccion;
                return okEstado && okRestriccion;
            });
            return;
        }

        var html = "";
        var visibles = 0;

        invitados.forEach(function (inv, i) {
            var coincideNombre = inv.nombre.toLowerCase().indexOf(query) !== -1 ||
                inv.miembros.some(function (m) {
                    return m.nombre.toLowerCase().indexOf(query) !== -1;
                });

            if (!coincideNombre) {
                return;
            }

            visibles++;

            var miembrosHtml = inv.miembros.map(function (m) {
                var rest = m.restriccion
                    ? '<span class="invitado__miembro_restriccion">(' + etiquetaRestriccion[m.restriccion] + ")</span>"
                    : "";

                return '<div class="invitado__miembro">' +
                    '<span class="invitado__miembro_info">' +
                        '<span class="invitado__miembro_nombre">' + escapar(m.nombre) + "</span>" + rest +
                    "</span>" +
                    '<span class="invitado__miembro_estado invitado__miembro_estado_' + m.estado + '">' + etiquetas[m.estado] + "</span>" +
                "</div>";
            }).join("");

            html +=
                '<article class="invitado" data_indice="' + i + '">' +
                    '<div class="invitado__top">' +
                        '<h2 class="invitado__nombre">' + escapar(inv.nombre) + "</h2>" +
                        '<span class="invitado__lugares">' + escapar(inv.mesa) + "</span>" +
                    "</div>" +
                    '<div class="invitado__miembros">' + miembrosHtml + "</div>" +
                    '<div class="invitado__acciones">' +
                        '<button class="invitado__btn invitado__btn_editar" type="button" data_editar="' + i + '">Editar</button>' +
                        '<button class="invitado__btn invitado__btn_eliminar" type="button" data_eliminar="' + i + '">Eliminar</button>' +
                    "</div>" +
                "</article>";
        });

        lista.innerHTML = html;
        vacio.hidden = visibles > 0;
        renderRestricciones();
    }

    function renderListaPlana(query, predicado) {
        var filas = [];

        invitados.forEach(function (inv) {
            inv.miembros.forEach(function (m) {
                if (!predicado(m)) {
                    return;
                }
                if (query && m.nombre.toLowerCase().indexOf(query) === -1) {
                    return;
                }
                filas.push({ nombre: m.nombre, mesa: inv.mesa, restriccion: m.restriccion, estado: m.estado });
            });
        });

        filas.sort(function (a, b) {
            var mesaA = parseInt(a.mesa.replace(/\D/g, ""), 10) || 0;
            var mesaB = parseInt(b.mesa.replace(/\D/g, ""), 10) || 0;
            if (mesaA !== mesaB) {
                return mesaA - mesaB;
            }
            return a.nombre.localeCompare(b.nombre);
        });

        lista.innerHTML = filas.map(function (fila, i) {
            var rest = fila.restriccion
                ? '<span class="resultado__restriccion">(' + etiquetaRestriccion[fila.restriccion] + ")</span>"
                : "";

            return '<div class="resultado" style="animation-delay:' + (i * 0.04) + 's">' +
                '<span class="resultado__info">' +
                    '<span class="resultado__nombre">' + escapar(fila.nombre) + "</span>" + rest +
                "</span>" +
                '<span class="resultado__lado">' +
                    '<span class="resultado__mesa">' + escapar(fila.mesa) + "</span>" +
                    '<span class="invitado__miembro_estado invitado__miembro_estado_' + fila.estado + '">' + etiquetas[fila.estado] + "</span>" +
                "</span>" +
            "</div>";
        }).join("");

        vacio.hidden = filas.length > 0;
        renderRestricciones();
    }

    function contarPersonas(estado) {
        return invitados.reduce(function (acc, inv) {
            return acc + inv.miembros.filter(function (m) {
                return m.estado === estado;
            }).length;
        }, 0);
    }

    function actualizarContadores() {
        document.getElementById("cat_total").textContent = invitados.reduce(function (acc, inv) {
            return acc + inv.miembros.length;
        }, 0);
        document.getElementById("cat_asiste").textContent = contarPersonas("confirmado");
        document.getElementById("cat_no_asiste").textContent = contarPersonas("no_asiste");
        document.getElementById("cat_pendiente").textContent = contarPersonas("pendiente");
    }

    categorias.forEach(function (categoria) {
        categoria.addEventListener("click", function () {
            categorias.forEach(function (c) { c.classList.remove("categoria_activa"); });
            categoria.classList.add("categoria_activa");
            filtroActual = categoria.getAttribute("data_filtro");
            render();
        });
    });

    buscador.addEventListener("input", render);

    document.getElementById("restricciones").addEventListener("click", function (event) {
        var btn = event.target.closest("[data_restriccion]");
        if (!btn) {
            return;
        }
        var clave = btn.getAttribute("data_restriccion");
        filtroRestriccion = filtroRestriccion === clave ? null : clave;
        render();
    });

    lista.addEventListener("click", function (event) {
        var btnEliminar = event.target.closest("[data_eliminar]");
        if (btnEliminar) {
            var indice = parseInt(btnEliminar.getAttribute("data_eliminar"), 10);
            invitados.splice(indice, 1);
            actualizarContadores();
            render();
            return;
        }

        var btnEditar = event.target.closest("[data_editar]");
        if (btnEditar) {
            abrirEditar(parseInt(btnEditar.getAttribute("data_editar"), 10));
        }
    });

    var lightbox = document.getElementById("lightbox");
    var vistas = lightbox.querySelectorAll(".vista");
    var indCantidad = document.getElementById("ind_cantidad");
    var indNombres = document.getElementById("ind_nombres");
    var famIntegrantes = document.getElementById("fam_integrantes");
    var famAgregar = document.getElementById("fam_agregar");

    function mostrarVista(nombre) {
        vistas.forEach(function (v) {
            v.classList.toggle("vista_activa", v.getAttribute("data_vista") === nombre);
        });
    }

    function abrirLightbox() {
        editandoIndice = null;
        mesaSeleccionada = null;
        actualizarBotonesMesa();
        document.getElementById("form_individual").reset();
        document.getElementById("form_familiar").reset();
        renderNombresIndividuales();
        famIntegrantes.innerHTML = "";
        agregarIntegrante();
        mostrarVista("inicio");
        lightbox.classList.add("lightbox_visible");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function abrirEditar(indice) {
        var inv = invitados[indice];
        editandoIndice = indice;
        mesaSeleccionada = inv.mesa;
        actualizarBotonesMesa();
        document.getElementById("form_individual").reset();
        document.getElementById("form_familiar").reset();

        if (inv.miembros.length === 1) {
            indCantidad.value = 1;
            renderNombresIndividuales();
            indNombres.querySelector(".campo__input").value = inv.miembros[0].nombre;
            document.getElementById("ind_wa").value = inv.tel || "";
            mostrarVista("individual");
        } else {
            document.getElementById("fam_nombre").value = inv.nombre;
            famIntegrantes.innerHTML = "";
            inv.miembros.forEach(function () {
                agregarIntegrante();
            });
            famIntegrantes.querySelectorAll(".campo__input").forEach(function (input, i) {
                input.value = inv.miembros[i].nombre;
            });
            document.getElementById("fam_wa").value = inv.tel || "";
            mostrarVista("familiar");
        }

        lightbox.classList.add("lightbox_visible");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function cerrarLightbox() {
        lightbox.classList.remove("lightbox_visible");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function renderNombresIndividuales() {
        var cantidad = parseInt(indCantidad.value, 10);
        if (isNaN(cantidad) || cantidad < 1) {
            cantidad = 1;
        }
        if (cantidad > 5) {
            cantidad = 5;
            indCantidad.value = 5;
        }

        var html = "";
        for (var n = 1; n <= cantidad; n++) {
            html +=
                '<div class="campo">' +
                    '<label class="campo__label" for="ind_nombre_' + n + '">Nombre y apellido ' + n + ' *</label>' +
                    '<input class="campo__input" id="ind_nombre_' + n + '" type="text" placeholder="Nombre y apellido" required>' +
                "</div>";
        }
        indNombres.innerHTML = html;
    }

    function agregarIntegrante() {
        var filas = famIntegrantes.querySelectorAll(".familiar__fila");
        if (filas.length >= 5) {
            return;
        }

        var numero = filas.length + 1;
        var fila = document.createElement("div");
        fila.className = "familiar__fila";
        fila.innerHTML =
            '<input class="campo__input" type="text" placeholder="Nombre y apellido" aria-label="Integrante ' + numero + '" required>' +
            '<button class="familiar__btn_eliminar" type="button">Eliminar</button>';
        famIntegrantes.appendChild(fila);
    }

    function eliminarIntegrante(fila) {
        var filas = famIntegrantes.querySelectorAll(".familiar__fila");
        if (filas.length <= 1) {
            return;
        }
        fila.remove();
    }

    lightbox.querySelector(".lightbox__cerrar").addEventListener("click", cerrarLightbox);

    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) {
            cerrarLightbox();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && lightbox.classList.contains("lightbox_visible") &&
            !lightboxMesas.classList.contains("lightbox_visible")) {
            cerrarLightbox();
        }
    });

    lightbox.querySelectorAll("[data_abrir]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            mostrarVista(btn.getAttribute("data_abrir"));
        });
    });

    lightbox.querySelectorAll("[data_cancelar]").forEach(function (btn) {
        btn.addEventListener("click", cerrarLightbox);
    });

    indCantidad.addEventListener("input", renderNombresIndividuales);

    famAgregar.addEventListener("click", agregarIntegrante);

    famIntegrantes.addEventListener("click", function (event) {
        var btn = event.target.closest(".familiar__btn_eliminar");
        if (btn) {
            eliminarIntegrante(btn.closest(".familiar__fila"));
        }
    });

    function finalizarEnvio() {
        var fueEdicion = editandoIndice !== null;
        cerrarLightbox();
        editandoIndice = null;
        mesaSeleccionada = null;
        actualizarBotonesMesa();
        actualizarContadores();
        render();
        mostrarExito(fueEdicion ? "Invitación guardada" : "Invitación enviada");
    }

    document.getElementById("form_individual").addEventListener("submit", function (event) {
        event.preventDefault();

        var nombres = [];
        indNombres.querySelectorAll(".campo__input").forEach(function (input) {
            if (input.value.trim()) {
                nombres.push(input.value.trim());
            }
        });

        var mensaje = armarMensajeIndividual(nombres, mesaSeleccionada);

        var numero = document.getElementById("ind_wa").value;

        if (editandoIndice !== null) {
            var inv = invitados[editandoIndice];
            inv.miembros = nombres.map(function (nombre, i) {
                return {
                    nombre: nombre,
                    estado: inv.miembros[i] ? inv.miembros[i].estado : "pendiente"
                };
            });
            inv.nombre = nombres[0] || inv.nombre;
            inv.mesa = mesaSeleccionada || inv.mesa;
            inv.tel = numero;
        } else {
            var nuevasCards = nombres.map(function (nombre) {
                return {
                    nombre: nombre,
                    mesa: mesaSeleccionada || "Sin mesa",
                    tel: numero,
                    miembros: [{ nombre: nombre, estado: "pendiente" }]
                };
            });
            invitados.splice.apply(invitados, [0, 0].concat(nuevasCards));
        }

        window.open(armarLinkWhatsapp(numero, mensaje), "_blank");

        event.target.reset();
        renderNombresIndividuales();
        finalizarEnvio();
    });

    document.getElementById("form_familiar").addEventListener("submit", function (event) {
        event.preventDefault();

        var familia = document.getElementById("fam_nombre").value.trim();
        var integrantes = [];
        famIntegrantes.querySelectorAll(".campo__input").forEach(function (input) {
            if (input.value.trim()) {
                integrantes.push(input.value.trim());
            }
        });

        var mensaje = armarMensajeFamiliar(familia || "vuestra familia", integrantes, mesaSeleccionada);

        var numero = document.getElementById("fam_wa").value;

        if (editandoIndice !== null) {
            var inv = invitados[editandoIndice];
            inv.nombre = familia || inv.nombre;
            inv.mesa = mesaSeleccionada || inv.mesa;
            inv.tel = numero;
            inv.miembros = integrantes.map(function (nombre, i) {
                return {
                    nombre: nombre,
                    estado: inv.miembros[i] ? inv.miembros[i].estado : "pendiente"
                };
            });
        } else {
            invitados.unshift({
                nombre: familia || "Familia sin nombre",
                mesa: mesaSeleccionada || "Sin mesa",
                tel: numero,
                miembros: integrantes.map(function (nombre) {
                    return { nombre: nombre, estado: "pendiente" };
                })
            });
        }

        window.open(armarLinkWhatsapp(numero, mensaje), "_blank");

        event.target.reset();
        famIntegrantes.innerHTML = "";
        agregarIntegrante();
        finalizarEnvio();
    });

    var lightboxMesas = document.getElementById("lightbox_mesas");
    var mesasLista = document.getElementById("mesas_lista");
    var mesaSeleccionada = null;
    var editandoIndice = null;

    function agruparMesas() {
        var orden = [];
        var grupos = {};

        invitados.forEach(function (inv) {
            if (!grupos[inv.mesa]) {
                grupos[inv.mesa] = [];
                orden.push(inv.mesa);
            }
            inv.miembros.forEach(function (m) {
                grupos[inv.mesa].push(m.nombre);
            });
        });

        orden.sort(function (a, b) {
            return parseInt(a.replace(/\D/g, ""), 10) - parseInt(b.replace(/\D/g, ""), 10);
        });

        return orden.map(function (nombre) {
            return { nombre: nombre, integrantes: grupos[nombre] };
        });
    }

    function renderMesas() {
        var mesas = agruparMesas();

        mesasLista.innerHTML = mesas.map(function (mesa) {
            var activa = mesaSeleccionada === mesa.nombre ? " mesa_activa" : "";
            var integrantes = mesa.integrantes.map(function (nombre) {
                return '<span class="mesa__integrante">' + escapar(nombre) + "</span>";
            }).join("");

            return '<button class="mesa' + activa + '" type="button" data_mesa="' + escapar(mesa.nombre) + '">' +
                '<span class="mesa__top">' +
                    '<span class="mesa__nombre">' + escapar(mesa.nombre) + "</span>" +
                    '<span class="mesa__cantidad">' + mesa.integrantes.length + " int.</span>" +
                "</span>" +
                '<span class="mesa__integrantes">' + integrantes + "</span>" +
            "</button>";
        }).join("");
    }

    function abrirMesas() {
        renderMesas();
        lightboxMesas.classList.add("lightbox_visible");
        lightboxMesas.setAttribute("aria-hidden", "false");
    }

    function cerrarMesas() {
        lightboxMesas.classList.remove("lightbox_visible");
        lightboxMesas.setAttribute("aria-hidden", "true");
    }

    function actualizarBotonesMesa() {
        var texto = mesaSeleccionada || "Asignar mesa";
        lightbox.querySelectorAll("[data_mesa_asignar]").forEach(function (btn) {
            btn.textContent = texto;
        });
    }

    var exito = document.getElementById("exito");
    var exitoTimer = null;

    function mostrarExito(texto) {
        clearTimeout(exitoTimer);
        exito.querySelector(".exito__texto").textContent = texto || "Mesa asignada";
        exito.classList.add("exito_visible");
        exito.setAttribute("aria-hidden", "false");
        exitoTimer = setTimeout(function () {
            exito.classList.remove("exito_visible");
            exito.setAttribute("aria-hidden", "true");
        }, 1500);
    }

    function armarLinkWhatsapp(numero, mensaje) {
        var digitos = numero.replace(/\D/g, "");
        if (digitos.indexOf("54") !== 0) {
            digitos = "54" + digitos;
        }
        return "https://wa.me/" + digitos + "?text=" + encodeURIComponent(mensaje);
    }

    var LINK_FIESTA = "https://mi-invitacion.com/tu-invitacion";

    function lineaMesa(mesa) {
        if (!mesa || mesa === "Sin mesa") {
            return "";
        }
        return "■  _*Mesa asignada: " + mesa.replace(/\D/g, "") + "*_\n\n";
    }

    function cierreMensaje() {
        return "■ En este link están todos los detalles de la fiesta:\n\n" +
            "➤ " + LINK_FIESTA + "\n\n" +
            "¡Será una alegría celebrar juntos este momento tan especial! ✦✦\n\n" +
            "¡Que sea un momento mágico! ✹✹";
    }

    function saludoIndividual(nombres) {
        var cortos = nombres.map(function (nombre) {
            return nombre.trim().split(" ")[0];
        });

        if (cortos.length === 1) {
            return "¡Hola, " + cortos[0] + "!";
        }
        if (cortos.length === 2) {
            return "¡Hola, " + cortos[0] + " y " + cortos[1] + "!";
        }
        return "¡Hola, " + cortos.slice(0, -1).join(", ") + " y " + cortos[cortos.length - 1] + "!";
    }

    function armarMensajeIndividual(nombres, mesa) {
        return "➤  " + saludoIndividual(nombres) + "\n\n" +
            lineaMesa(mesa) +
            cierreMensaje();
    }

    function armarMensajeFamiliar(familia, integrantes, mesa) {
        var lista = integrantes.map(function (nombre) {
            return "■ " + nombre;
        }).join("\n");

        return "➤  ¡Hola, " + familia + "!\n" +
            "--- Integrantes:\n" + lista + "\n" +
            "¡Nos alegra compartir una celebración muy especial! ❤\n\n" +
            lineaMesa(mesa) +
            cierreMensaje();
    }

    lightbox.querySelectorAll("[data_mesa_asignar]").forEach(function (btn) {
        btn.addEventListener("click", abrirMesas);
    });

    lightboxMesas.querySelector(".lightbox__cerrar").addEventListener("click", cerrarMesas);

    lightboxMesas.addEventListener("click", function (event) {
        if (event.target === lightboxMesas) {
            cerrarMesas();
        }
    });

    mesasLista.addEventListener("click", function (event) {
        var mesa = event.target.closest("[data_mesa]");
        if (!mesa) {
            return;
        }
        mesaSeleccionada = mesa.getAttribute("data_mesa");
        actualizarBotonesMesa();
        cerrarMesas();
        mostrarExito("Mesa asignada");
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && lightboxMesas.classList.contains("lightbox_visible")) {
            cerrarMesas();
        }
    });

    document.querySelector(".agregar").addEventListener("click", abrirLightbox);

    renderNombresIndividuales();
    agregarIntegrante();

    actualizarContadores();
    render();
})();
