(function () {
    "use strict";

    var MAGENTA = [236, 44, 135];
    var OSCURO = [37, 44, 72];
    var GRIS = [138, 138, 138];
    var GRIS_CLARO = [176, 176, 176];
    var ROSA_SUAVE = [253, 237, 244];
    var ROSA_FILA = [253, 245, 249];
    var ROSA_LINEA = [243, 227, 234];
    var MARGEN = 50;
    var LIMITE_Y = 790;

    function generarPDF(invitados, playlist) {
        var doc = new window.jspdf.jsPDF({ unit: "pt", format: "a4" });
        var ancho = doc.internal.pageSize.getWidth();
        var anchoContenido = ancho - MARGEN * 2;
        var y = 55;

        function bajar(dy) {
            y += dy;
            if (y > LIMITE_Y) {
                doc.addPage();
                y = 55;
            }
        }

        function espacioNecesario(alto) {
            if (y + alto > LIMITE_Y) {
                doc.addPage();
                y = 55;
            }
        }

        function texto(txt, opciones) {
            opciones = opciones || {};
            doc.setFont("helvetica", opciones.bold ? "bold" : "normal");
            doc.setFontSize(opciones.size || 10);
            doc.setTextColor(opciones.color[0], opciones.color[1], opciones.color[2]);

            var x = opciones.x != null ? opciones.x : MARGEN;
            if (opciones.center) {
                x = (ancho - doc.getTextWidth(txt)) / 2;
            } else if (opciones.right) {
                x = ancho - MARGEN - doc.getTextWidth(txt);
            }

            doc.text(txt, x, y);
            bajar(opciones.paso || (opciones.size || 10) * 1.4);
        }

        function lineaPartes(partes, x, yBase) {
            partes.forEach(function (p) {
                doc.setFont("helvetica", p.bold ? "bold" : "normal");
                doc.setFontSize(p.size || 9);
                doc.setTextColor(p.color[0], p.color[1], p.color[2]);
                doc.text(p.txt, x, yBase);
                x += doc.getTextWidth(p.txt);
            });
        }

        function franja(titulo) {
            espacioNecesario(60);
            doc.setFillColor(ROSA_SUAVE[0], ROSA_SUAVE[1], ROSA_SUAVE[2]);
            doc.roundedRect(MARGEN, y, anchoContenido, 24, 5, 5, "F");
            doc.setFillColor(MAGENTA[0], MAGENTA[1], MAGENTA[2]);
            doc.roundedRect(MARGEN, y, 4, 24, 2, 2, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(MAGENTA[0], MAGENTA[1], MAGENTA[2]);
            doc.text(titulo, MARGEN + 14, y + 16);
            y += 24 + 12;
        }

        function card(inv) {
            espacioNecesario(40 + inv.miembros.length * 13);

            var yBase = y + 11;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(OSCURO[0], OSCURO[1], OSCURO[2]);
            doc.text(inv.nombre, MARGEN, yBase);

            doc.setFontSize(8.5);
            doc.setTextColor(MAGENTA[0], MAGENTA[1], MAGENTA[2]);
            doc.text(inv.mesa, ancho - MARGEN - doc.getTextWidth(inv.mesa), yBase);
            y += 16;

            inv.miembros.forEach(function (m) {
                var x = MARGEN + 12;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(74, 74, 74);
                var etiqueta = "- " + m.nombre;
                doc.text(etiqueta, x, y + 9);
                x += doc.getTextWidth(etiqueta);

                if (m.restriccion) {
                    doc.setFontSize(7.5);
                    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
                    doc.text("  (" + m.restriccion + ")", x, y + 9);
                }
                y += 13;
            });

            doc.setDrawColor(ROSA_LINEA[0], ROSA_LINEA[1], ROSA_LINEA[2]);
            doc.setLineWidth(0.6);
            doc.line(MARGEN, y + 3, ancho - MARGEN, y + 3);
            y += 14;
        }

        function seccion(titulo, items) {
            franja(titulo);

            if (!items.length) {
                texto("Sin registros.", { size: 9, color: GRIS });
                bajar(14);
                return;
            }

            items.forEach(card);
            bajar(4);
        }

        var fecha = new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        doc.setFillColor(MAGENTA[0], MAGENTA[1], MAGENTA[2]);
        doc.roundedRect(MARGEN, 55, 60, 4, 2, 2, "F");

        texto("ORGANIZÁ TU FIESTA", { size: 8, bold: true, color: MAGENTA, center: true, paso: 22 });
        texto("Información del evento", { size: 18, bold: true, color: OSCURO, center: true, paso: 20 });
        texto(fecha, { size: 9, color: GRIS, center: true, paso: 16 });
        doc.setDrawColor(MAGENTA[0], MAGENTA[1], MAGENTA[2]);
        doc.setLineWidth(1.4);
        doc.line(MARGEN, y, ancho - MARGEN, y);
        bajar(24);

        seccion("Confirmados", (invitados || []).filter(function (inv) {
            return inv.miembros.some(function (m) { return m.estado === "confirmado"; });
        }));
        seccion("Pendientes", (invitados || []).filter(function (inv) {
            return inv.miembros.some(function (m) { return m.estado === "pendiente"; });
        }));
        seccion("Sin confirmar", (invitados || []).filter(function (inv) {
            return inv.miembros.some(function (m) { return m.estado === "sin_confirmar"; });
        }));
        seccion("No asisten", (invitados || []).filter(function (inv) {
            return inv.miembros.some(function (m) { return m.estado === "no_asiste"; });
        }));

        doc.addPage();
        y = 55;
        franja("Playlist sugerida");

        var canciones = playlist || [];
        if (!canciones.length) {
            texto("Sin registros.", { size: 9, color: GRIS });
        } else {
            canciones.forEach(function (rec, i) {
                espacioNecesario(20);

                if (i % 2 === 0) {
                    doc.setFillColor(ROSA_FILA[0], ROSA_FILA[1], ROSA_FILA[2]);
                    doc.rect(MARGEN, y, anchoContenido, 18, "F");
                }

                lineaPartes([
                    { txt: rec.nombre, bold: true, size: 9, color: OSCURO },
                    { txt: ", recomendó: ", bold: false, size: 8.5, color: GRIS },
                    { txt: rec.cancion, bold: true, size: 9, color: OSCURO },
                    { txt: "  -  " + rec.artista, bold: false, size: 8.5, color: GRIS }
                ], MARGEN + 10, y + 12);

                y += 18;
            });
        }

        var totalPaginas = doc.internal.getNumberOfPages();
        for (var p = 1; p <= totalPaginas; p++) {
            doc.setPage(p);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(GRIS_CLARO[0], GRIS_CLARO[1], GRIS_CLARO[2]);
            doc.text("Página " + p + " de " + totalPaginas, ancho - MARGEN - doc.getTextWidth("Página " + p + " de " + totalPaginas), 820);
        }

        doc.save("informacion-evento.pdf");
    }

    window.stylesPDF = {
        generarPDF: generarPDF
    };
})();
