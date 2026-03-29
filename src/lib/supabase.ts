import { createClient } from "@supabase/supabase-js";

// Stejný Supabase projekt jako partnerská appka
const SUPABASE_URL = "https://ysyvbjzpoxpttoofjwfc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzeXZianpwb3hwdHRvb2Zqd2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjA1MjMsImV4cCI6MjA5MDA5NjUyM30.ijbZQyEQZAAxhf2ikyW9CyrWJZA46gpCsoYzTuVlLXg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Types ───────────────────────────────────────────────────────────

export type SupabasePartner = {
  id: string;
  user_id: string;
  jmeno: string;
  firma: string | null;
  telefon: string;
  email: string;
  kategorie: string; // 'zamecnik' | 'odtahovka' | 'servis' | 'instalater'
  adresa: string | null;
  lat: number | null;
  lng: number | null;
  zona: string;
  hodnoceni: number;
  pocet_recenzi: number;
  is_online: boolean;
  foto_url: string | null;
  created_at: string;
};

export type SupabaseSosRequest = {
  id: string;
  customer_id: string | null;
  kategorie: string;
  popis: string | null;
  lat: number;
  lng: number;
  adresa: string | null;
  status: string; // 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  accepted_by: string | null;
  accepted_at: string | null;
  completed_at: string | null;
  created_at: string;
};

// ── API ─────────────────────────────────────────────────────────────

/** Načte všechny online partnery s polohou */
export async function getOnlinePartners(): Promise<SupabasePartner[]> {
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("is_online", true)
    .not("lat", "is", null)
    .not("lng", "is", null);

  if (error) {
    console.error("Chyba při načítání partnerů:", error);
    return [];
  }
  return data ?? [];
}

/** Načte VŠECHNY partnery se sídlem (lat/lng) — pro mapu i vyhledávání */
export async function getAllPartnersWithLocation(): Promise<SupabasePartner[]> {
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .not("lat", "is", null)
    .not("lng", "is", null);

  if (error) {
    console.error("Chyba při načítání všech partnerů:", error);
    return [];
  }
  return data ?? [];
}

/** Odešle SOS request do databáze */
export async function createSosRequest(params: {
  kategorie: string;
  popis?: string;
  lat: number;
  lng: number;
  adresa?: string;
}): Promise<SupabaseSosRequest | null> {
  const { data, error } = await supabase
    .from("sos_requests")
    .insert({
      kategorie: params.kategorie,
      popis: params.popis ?? null,
      lat: params.lat,
      lng: params.lng,
      adresa: params.adresa ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Chyba při odesílání SOS:", error);
    return null;
  }
  return data;
}

/** Sleduje změny na SOS requestu (realtime) */
export function subscribeSosRequest(
  requestId: string,
  onUpdate: (request: SupabaseSosRequest) => void
) {
  const channel = supabase
    .channel(`sos-request-${requestId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "sos_requests",
        filter: `id=eq.${requestId}`,
      },
      (payload) => {
        onUpdate(payload.new as SupabaseSosRequest);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
