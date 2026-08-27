import {
  MercadoPagoConfig,
  Preference,
  Payment
} from "mercadopago";

import Sale from "../models/sale.model.js";


function getMercadoPagoClients() {
  const accessToken =
    process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      "MP_ACCESS_TOKEN no está configurado en el servidor"
    );
  }

  const client =
    new MercadoPagoConfig({
      accessToken:
        accessToken.trim()
    });

  return {
    preferenceClient:
      new Preference(client),

    paymentClient:
      new Payment(client)
  };
}


/*
 * ============================================================
 * CREAR PREFERENCIA DE PAGO
 * ============================================================
 *
 * POST /payments/preference/:saleId
 *
 * Solo funciona para ventas en estado CREADA.
 */

export async function createPaymentPreference(
  req,
  res
) {
  try {
    const {
      preferenceClient
    } =
      getMercadoPagoClients();

    const {
      saleId
    } =
      req.params;

    const sale =
      await Sale.findById(
        saleId
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
      "CREADA"
    ) {
      return res
        .status(400)
        .json({
          message:
            "Solo se puede generar un pago para una venta en estado CREADA"
        });
    }

    /*
     * Convertimos los productos de la venta
     * al formato esperado por Mercado Pago.
     */
    const items =
      sale.items.map(
        item => ({
          id:
            item.sku,

          title:
            item.nombre,

          quantity:
            Number(
              item.cantidad
            ),

          unit_price:
            Number(
              item.precioUnitario
            ),

          currency_id:
            "ARS"
        })
      );

    /*
     * ========================================================
     * CONFIGURACIÓN LOCAL / PRODUCCIÓN
     * ========================================================
     *
     * LOCAL:
     *
     * FRONTEND_URL=http://localhost:5173
     * BACKEND_URL=http://localhost:4000
     *
     * → Checkout funciona.
     * → No enviamos back_urls.
     * → No enviamos auto_return.
     * → No enviamos notification_url.
     *
     *
     * PRODUCCIÓN:
     *
     * FRONTEND_URL=https://....vercel.app
     * BACKEND_URL=https://....railway.app
     *
     * → Checkout funciona.
     * → Retorno automático.
     * → Webhook.
     * → CREADA pasa automáticamente a PAGADA.
     */

    const frontendUrl =
      process.env.FRONTEND_URL?.trim();

    const backendUrl =
      process.env.BACKEND_URL?.trim();

    const frontendEsPublico =
      Boolean(
        frontendUrl &&
        frontendUrl.startsWith(
          "https://"
        )
      );

    const backendEsPublico =
      Boolean(
        backendUrl &&
        backendUrl.startsWith(
          "https://"
        )
      );

    /*
     * Objeto base de la preferencia.
     *
     * Esto funciona siempre,
     * incluso en localhost.
     */
    const preferenceBody = {
      items,

      /*
       * Vinculamos Mercado Pago
       * con la venta AVAPORU.
       */
      external_reference:
        sale._id.toString(),

      metadata: {
        saleId:
          sale._id.toString()
      }
    };


    /*
     * ========================================================
     * RETORNO AUTOMÁTICO
     * ========================================================
     *
     * SOLO si el frontend es público.
     *
     * Mercado Pago no debe recibir localhost
     * como back_url para este flujo.
     */

    if (
      frontendEsPublico
    ) {
      preferenceBody.back_urls = {
        success:
          `${frontendUrl}/ventas?payment=success`,

        pending:
          `${frontendUrl}/ventas?payment=pending`,

        failure:
          `${frontendUrl}/ventas?payment=failure`
      };

      preferenceBody.auto_return =
        "approved";
    }


    /*
     * ========================================================
     * WEBHOOK
     * ========================================================
     *
     * SOLO si el backend es público.
     *
     * Mercado Pago necesita poder acceder
     * desde internet a esta URL.
     */

    if (
      backendEsPublico
    ) {
      preferenceBody.notification_url =
        `${backendUrl}/payments/webhook`;
    }


    /*
     * Información útil para debugging.
     *
     * NO mostramos secretos.
     */
    console.log(
      "Mercado Pago - creando preferencia:",
      {
        saleId:
          sale._id.toString(),

        frontendEsPublico,

        backendEsPublico,

        retornoAutomatico:
          frontendEsPublico,

        webhook:
          backendEsPublico
      }
    );


    /*
     * Crear Checkout Pro.
     */

    const preference =
      await preferenceClient.create({
        body:
          preferenceBody
      });


    /*
     * Guardamos los datos de la preferencia
     * dentro de la venta.
     */

    sale.pago = {
      metodo:
        "MERCADO_PAGO",

      estado:
        "PENDIENTE",

      preferenceId:
        preference.id
    };

    await sale.save();


    /*
     * Devolvemos las URLs.
     */

    return res.json({
      preferenceId:
        preference.id,

      checkoutUrl:
        preference.init_point,

      sandboxCheckoutUrl:
        preference.sandbox_init_point
    });

  } catch (error) {
    console.error(
      "Error creando preferencia Mercado Pago:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          "No se pudo generar el pago con Mercado Pago",

        error:
          error.message
      });
  }
}


/*
 * ============================================================
 * WEBHOOK MERCADO PAGO
 * ============================================================
 *
 * POST /payments/webhook
 *
 * Mercado Pago llama esta URL públicamente.
 *
 * IMPORTANTE:
 * No debe requerir login de AVAPORU.
 */

export async function mercadoPagoWebhook(
  req,
  res
) {
  try {
    const {
      paymentClient
    } =
      getMercadoPagoClients();

    /*
     * Mercado Pago puede enviar el ID
     * en diferentes lugares dependiendo
     * del formato de notificación.
     */
    const paymentId =
      req.body?.data?.id ||
      req.query?.["data.id"] ||
      req.query?.id;

    /*
     * Algunas notificaciones pueden
     * no corresponder a un pago.
     */
    if (!paymentId) {
      console.log(
        "Webhook recibido sin paymentId"
      );

      return res
        .sendStatus(200);
    }


    /*
     * Consultamos el pago directamente
     * en Mercado Pago.
     */
    const payment =
      await paymentClient.get({
        id:
          paymentId
      });


    console.log(
      "Webhook Mercado Pago:",
      {
        paymentId:
          payment.id,

        status:
          payment.status,

        externalReference:
          payment.external_reference
      }
    );


    /*
     * Recuperamos el ID de la venta AVAPORU.
     */
    const saleId =
      payment.external_reference ||
      payment.metadata?.saleId;


    if (!saleId) {
      console.warn(
        "Pago recibido sin referencia de venta:",
        paymentId
      );

      return res
        .sendStatus(200);
    }


    const sale =
      await Sale.findById(
        saleId
      );


    if (!sale) {
      console.warn(
        "Venta no encontrada para paymentId:",
        paymentId
      );

      return res
        .sendStatus(200);
    }


    /*
     * Inicializar información de pago
     * si por algún motivo no existe.
     */
    if (!sale.pago) {
      sale.pago = {
        metodo:
          "MERCADO_PAGO",

        estado:
          "PENDIENTE"
      };
    }


    /*
     * Guardar ID real del pago.
     */
    sale.pago.paymentId =
      String(
        payment.id
      );


    /*
     * ========================================================
     * ACTUALIZAR ESTADOS
     * ========================================================
     */

    switch (
      payment.status
    ) {

      case "approved":

        sale.pago.estado =
          "APROBADO";

        sale.pago.fechaPago =
          new Date();

        /*
         * CREADA → PAGADA
         */
        sale.estado =
          "PAGADA";

        break;


      case "rejected":

        sale.pago.estado =
          "RECHAZADO";

        break;


      case "cancelled":

        sale.pago.estado =
          "CANCELADO";

        break;


      case "refunded":

        sale.pago.estado =
          "CANCELADO";

        break;


      default:

        sale.pago.estado =
          "PENDIENTE";
    }


    await sale.save();


    console.log(
      `Venta ${sale._id} actualizada a ${sale.estado}`
    );


    return res
      .sendStatus(200);

  } catch (error) {
    console.error(
      "Error procesando webhook Mercado Pago:",
      error
    );

    /*
     * Mercado Pago puede reintentar
     * cuando recibe 500.
     */
    return res
      .sendStatus(500);
  }
}