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
     * URLs públicas.
     *
     * Para el flujo completo NO debemos usar localhost.
     *
     * FRONTEND_URL:
     * URL pública de Vercel.
     *
     * BACKEND_URL:
     * URL pública de Railway.
     */

    const frontendUrl =
      process.env.FRONTEND_URL;

    const backendUrl =
      process.env.BACKEND_URL;


    if (
      !frontendUrl ||
      !backendUrl
    ) {

      return res
        .status(500)
        .json({
          message:
            "Faltan FRONTEND_URL o BACKEND_URL en las variables de entorno"
        });

    }


    /*
     * Creamos la preferencia Checkout Pro.
     */

    const preference =
      await preferenceClient.create({
        body: {

          items,

          /*
           * Guardamos el ID de nuestra venta.
           *
           * Mercado Pago nos lo devuelve después
           * cuando consultamos el pago.
           */
          external_reference:
            sale._id.toString(),


          metadata: {
            saleId:
              sale._id.toString()
          },


          /*
           * Cuando termina el pago,
           * Mercado Pago vuelve al frontend.
           */

          back_urls: {

            success:
              `${frontendUrl}/ventas?payment=success`,

            pending:
              `${frontendUrl}/ventas?payment=pending`,

            failure:
              `${frontendUrl}/ventas?payment=failure`
          },


          /*
           * Si el pago queda aprobado,
           * vuelve automáticamente a AVAPORU.
           */

          auto_return:
            "approved",


          /*
           * Mercado Pago avisa al backend
           * cuando cambia el estado del pago.
           */

          notification_url:
            `${backendUrl}/payments/webhook`
        }
      });


    /*
     * Guardamos la preferencia en la venta.
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
     * Devolvemos las URLs del checkout.
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
     *
     * Respondemos 200 para evitar
     * reintentos innecesarios.
     */

    if (!paymentId) {

      console.log(
        "Webhook recibido sin paymentId"
      );

      return res
        .sendStatus(200);

    }


    /*
     * Consultamos el pago real
     * directamente a Mercado Pago.
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
     * Si la venta todavía no tiene
     * información de pago, la inicializamos.
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
     * Guardamos el ID real del pago.
     */

    sale.pago.paymentId =
      String(
        payment.id
      );


    /*
     * Actualizamos el estado.
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
         * Esta es la transición importante:
         *
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
     * cuando recibe error 500.
     */

    return res
      .sendStatus(500);

  }
}