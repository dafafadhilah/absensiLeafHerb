import supabase from "utils/supabaseClient";
import { setNotificationCount } from "../reducer/notification";

export const fetchNotificationCount = () => async (dispatch) => {
  try {
    // Fetch jumlah koreksi absensi yang berstatus "Pending"
    const { data: koreksiData, error: koreksiError } = await supabase
      .from("attendance_corrections")
      .select(
        "id, attendance_id, old_clock_in, old_clock_out,new_clock_in, new_clock_out, status,reason, users:user_id(email, name), attendance:attendance_id(date)"
      )
      .eq("status", "Pending")
      .order("request_date", { ascending: false });

    if (koreksiError) {
      console.error(
        "Error mengambil data koreksi absensi:",
        koreksiError.message
      );
      return;
    }

    // Fetch jumlah pengajuan lembur yang berstatus "Pending"
    const { data: lemburData, error: lemburError } = await supabase
      .from("overtime_requests")
      .select(
        "id, overtime_date, overtime_in, overtime_out, total_hours, reason, status, users:user_id(email, name)"
      )
      .eq("status", "Pending")
      .order("request_date", { ascending: false });

    if (lemburError) {
      console.error(
        "Error mengambil data pengajuan lembur:",
        lemburError.message
      );
      return;
    }

    // Dispatch ke reducer untuk menyimpan jumlah notifikasi
    dispatch(
      setNotificationCount({
        KoreksiAbsensi: koreksiData.length,
        PengajuanLembur: lemburData.length,
      })
    );
  } catch (error) {
    console.error("Fetch error:", error);
  }
};
