import { useState, useCallback } from "react";
import { listSales, createSale, updateSaleStatus } from "../../../services/salesServices";
import Swal from "sweetalert2";
import type { Sale } from "../types";

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSales();
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateStatus = async (id: string, estado: Sale["estado"]) => {
    try {
      await updateSaleStatus(id, estado);
      await fetchSales();
      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `La venta fue marcada como ${estado}`,
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el estado" });
    }
  };

  const handleCreateSale = async (saleData: any) => {
    try {
      setLoading(true);
      await createSale(saleData);
      Swal.fire({
        icon: "success",
        title: "Venta registrada",
        text: "La venta ha sido creada exitosamente.",
      });
      await fetchSales();
      return true;
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || "Ocurrió un error al crear la venta.";
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar la venta",
        text: msg,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sales,
    loading,
    fetchSales,
    handleUpdateStatus,
    handleCreateSale,
  };
}
