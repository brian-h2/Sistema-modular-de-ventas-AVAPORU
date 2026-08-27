import API from "./Api";

export interface PreferenceResponse {
  preferenceId: string;
  checkoutUrl: string;
  sandboxCheckoutUrl?: string;
  message?: string;
}

export const createPaymentPreference = async (saleId: string): Promise<PreferenceResponse> => {
  const response = await API.post(`/payments/preference/${saleId}`);
  return response.data;
};

export const payWithMercadoPago = async (saleId: string) => {
  const data = await createPaymentPreference(saleId);
  const checkoutUrl = data.sandboxCheckoutUrl || data.checkoutUrl;
  if (!checkoutUrl) {
    throw new Error("Mercado Pago no devolvió una URL de checkout.");
  }
  window.location.href = checkoutUrl;
};
