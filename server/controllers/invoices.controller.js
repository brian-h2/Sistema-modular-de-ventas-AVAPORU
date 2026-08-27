import PDFDocument from "pdfkit";
import Sale from "../models/sale.model.js";


/*
 * ============================================================
 * UTILIDADES
 * ============================================================
 */

function formatoMoneda(valor) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS"
    }
  ).format(
    Number(valor || 0)
  );
}


function formatoFecha(fecha) {
  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  ).format(
    new Date(fecha)
  );
}


/*
 * Generamos un número interno.
 *
 * NO ES numeración fiscal.
 *
 * Ejemplo:
 * AV-20260827-1724883286000
 */
function generarNumeroComprobante() {
  const ahora =
    new Date();

  const year =
    ahora
      .getFullYear();

  const month =
    String(
      ahora.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      ahora.getDate()
    ).padStart(
      2,
      "0"
    );

  return (
    `AV-${year}${month}${day}-${Date.now()}`
  );
}


/*
 * ============================================================
 * GENERAR COMPROBANTE
 * ============================================================
 *
 * POST /invoices/:saleId/generate
 *
 * Solamente una venta PAGADA puede generar
 * un comprobante.
 */

export async function generarComprobante(
  req,
  res
) {
  try {
    const {
      saleId
    } =
      req.params;


    const sale =
      await Sale
        .findById(
          saleId
        )
        .populate(
          "vendedor",
          "nombre email"
        );


    if (!sale) {
      return res
        .status(404)
        .json({
          message:
            "Venta no encontrada"
        });
    }


  /*
 * Si ya existe un comprobante,
 * no generamos otro.
 */
if (sale.factura) {
  return res.json({
    message:
      "La venta ya tiene un comprobante generado",

    factura:
      sale.factura,

    estado:
      sale.estado
  });
}


/*
 * Permitimos generar comprobante en:
 *
 * PAGADA:
 * venta nueva que todavía debe pasar a FACTURADA.
 *
 * FACTURADA:
 * ventas históricas que fueron marcadas como
 * facturadas antes de incorporar los comprobantes PDF.
 */
if (
  sale.estado !== "PAGADA" &&
  sale.estado !== "FACTURADA"
) {
  return res
    .status(400)
    .json({
      message:
        "Solo se puede generar un comprobante para una venta PAGADA o una venta FACTURADA sin comprobante"
    });
}


    /*
     * Generamos información del comprobante.
     */
    const numero =
      generarNumeroComprobante();


    sale.factura = {
      numero,

      fechaEmision:
        new Date(),

      tipo:
        "COMPROBANTE_VENTA",

      condicionCliente:
        "Consumidor Final",

      validezFiscal:
        false
    };


    /*
     * PAGADA → FACTURADA
     */
    sale.estado =
      "FACTURADA";


    await sale.save();


    console.log(
      `Comprobante ${numero} generado para venta ${sale._id}`
    );


    return res.json({
      ok: true,

      message:
        "Comprobante generado correctamente",

      estado:
        sale.estado,

      factura:
        sale.factura
    });

  } catch (error) {
    console.error(
      "Error generando comprobante:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          "No se pudo generar el comprobante",

        error:
          error.message
      });
  }
}


/*
 * ============================================================
 * DESCARGAR PDF
 * ============================================================
 *
 * GET /invoices/:saleId/pdf
 */

export async function descargarComprobantePDF(
  req,
  res
) {
  try {
    const {
      saleId
    } =
      req.params;


    const sale =
      await Sale
        .findById(
          saleId
        )
        .populate(
          "vendedor",
          "nombre email"
        );


    if (!sale) {
      return res
        .status(404)
        .json({
          message:
            "Venta no encontrada"
        });
    }


    if (
      sale.estado !==
        "FACTURADA" ||
      !sale.factura
    ) {
      return res
        .status(400)
        .json({
          message:
            "La venta todavía no posee un comprobante"
        });
    }


    /*
     * ========================================================
     * CONFIGURACIÓN DEL PDF
     * ========================================================
     */

    const doc =
      new PDFDocument({
        size: "A4",

        margin: 50,

        info: {
          Title:
            `Comprobante ${sale.factura.numero}`,

          Author:
            "AVAPORU"
        }
      });


    /*
     * Indicamos al navegador que se descargará
     * un PDF.
     */
    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="comprobante-${sale.factura.numero}.pdf"`
    );


    /*
     * PDFKit escribe directamente
     * sobre la respuesta HTTP.
     */
    doc.pipe(
      res
    );


    /*
     * ========================================================
     * ENCABEZADO
     * ========================================================
     */

    doc
      .fontSize(26)
      .font("Helvetica-Bold")
      .text(
        "AVAPORU",
        {
          align:
            "center"
        }
      );


    doc
      .moveDown(
        0.4
      );


    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(
        "COMPROBANTE DE VENTA",
        {
          align:
            "center"
        }
      );


    doc
      .moveDown(
        0.3
      );


    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(
        "SIN VALIDEZ FISCAL",
        {
          align:
            "center"
        }
      );


    doc
      .moveDown(
        1.5
      );


    /*
     * Línea divisoria
     */
    doc
      .moveTo(
        50,
        doc.y
      )
      .lineTo(
        545,
        doc.y
      )
      .stroke();


    doc
      .moveDown();


    /*
     * ========================================================
     * INFORMACIÓN DEL COMPROBANTE
     * ========================================================
     */

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(
        `Comprobante: ${sale.factura.numero}`
      );


    doc
      .font("Helvetica")
      .text(
        `Fecha de emisión: ${formatoFecha(sale.factura.fechaEmision)}`
      );


    doc
      .text(
        `Cliente: ${sale.cliente || "Consumidor Final"}`
      );


    doc
      .text(
        `Condición: ${sale.factura.condicionCliente || "Consumidor Final"}`
      );


    if (
      sale.vendedor?.nombre
    ) {
      doc.text(
        `Vendedor: ${sale.vendedor.nombre}`
      );
    }


    doc
      .moveDown();


    /*
     * Medio de pago
     */
    let medioPago =
      "No informado";


    if (
      sale.pago?.metodo ===
      "MERCADO_PAGO"
    ) {
      medioPago =
        "Mercado Pago";
    }

    if (
      sale.pago?.metodo ===
      "EFECTIVO"
    ) {
      medioPago =
        "Efectivo";
    }

    if (
      sale.pago?.metodo ===
      "OTRO"
    ) {
      medioPago =
        "Otro";
    }


    doc
      .text(
        `Medio de pago: ${medioPago}`
      );


    doc
      .text(
        "Estado del pago: PAGADO"
      );


    doc
      .moveDown(
        1.5
      );


    /*
     * ========================================================
     * DETALLE DE PRODUCTOS
     * ========================================================
     */

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(
        "Detalle de la venta"
      );


    doc
      .moveDown(
        0.7
      );


    const inicioY =
      doc.y;


    /*
     * Encabezado de columnas.
     */
    doc
      .fontSize(10)
      .font("Helvetica-Bold");


    doc.text(
      "Producto",
      50,
      inicioY,
      {
        width:
          220
      }
    );


    doc.text(
      "Cant.",
      280,
      inicioY,
      {
        width:
          50,

        align:
          "right"
      }
    );


    doc.text(
      "Precio",
      340,
      inicioY,
      {
        width:
          90,

        align:
          "right"
      }
    );


    doc.text(
      "Subtotal",
      440,
      inicioY,
      {
        width:
          105,

        align:
          "right"
      }
    );


    doc
      .moveDown();


    doc
      .moveTo(
        50,
        doc.y
      )
      .lineTo(
        545,
        doc.y
      )
      .stroke();


    doc
      .moveDown(
        0.5
      );


    /*
     * Productos.
     */
    sale.items.forEach(
      item => {
        const y =
          doc.y;


        const subtotal =
          Number(
            item.cantidad
          ) *
          Number(
            item.precioUnitario
          );


        doc
          .font("Helvetica")
          .fontSize(10);


        doc.text(
          item.nombre,
          50,
          y,
          {
            width:
              220
          }
        );


        doc.text(
          String(
            item.cantidad
          ),
          280,
          y,
          {
            width:
              50,

            align:
              "right"
          }
        );


        doc.text(
          formatoMoneda(
            item.precioUnitario
          ),
          340,
          y,
          {
            width:
              90,

            align:
              "right"
          }
        );


        doc.text(
          formatoMoneda(
            subtotal
          ),
          440,
          y,
          {
            width:
              105,

            align:
              "right"
          }
        );


        /*
         * Dejamos espacio para
         * la próxima línea.
         */
        doc.y =
          Math.max(
            doc.y,
            y + 25
          );
      }
    );


    doc
      .moveDown(
        0.5
      );


    doc
      .moveTo(
        50,
        doc.y
      )
      .lineTo(
        545,
        doc.y
      )
      .stroke();


    doc
      .moveDown();


    /*
     * ========================================================
     * TOTAL
     * ========================================================
     */

    doc
      .fontSize(15)
      .font("Helvetica-Bold")
      .text(
        `TOTAL: ${formatoMoneda(sale.total)}`,
        {
          align:
            "right"
        }
      );


    doc
      .moveDown(
        2
      );


    /*
     * ========================================================
     * ACLARACIÓN
     * ========================================================
     */

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(
        "Documento interno generado por el sistema AVAPORU.",
        {
          align:
            "center"
        }
      );


    doc
      .font("Helvetica-Bold")
      .text(
        "Este comprobante no posee validez fiscal y no reemplaza una factura electrónica autorizada por ARCA.",
        {
          align:
            "center"
        }
      );


    doc
      .moveDown();


    doc
      .font("Helvetica")
      .fontSize(8)
      .text(
        `ID interno de venta: ${sale._id}`,
        {
          align:
            "center"
        }
      );


    /*
     * Terminamos el documento.
     */
    doc.end();

  } catch (error) {
    console.error(
      "Error generando PDF:",
      error
    );


    /*
     * Si todavía no comenzamos a enviar
     * el PDF, devolvemos JSON.
     */
    if (
      !res.headersSent
    ) {
      return res
        .status(500)
        .json({
          message:
            "No se pudo descargar el comprobante",

          error:
            error.message
        });
    }
  }
}