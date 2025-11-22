import  { useState } from "react";

// -------- Types --------
type IPWhoIsResponse = {
  ip: string;
  success: boolean;
  type?: string;
  continent?: string;
  continent_code?: string;
  country?: string;
  country_code?: string;
  region?: string;
  region_code?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  postal?: string;
  calling_code?: string;
  capital?: string;
  flag?: {
    img?: string;
    emoji?: string;
    emoji_unicode?: string;
  };
  connection?: {
    asn?: number;
    org?: string;
    isp?: string;
    domain?: string;
  };
  timezone?: {
    id?: string;
    abbr?: string;
    offset?: number;
    utc?: string;
    current_time?: string;
  };
  [key: string]: any;
};

// -------- API Helper --------
class IPWhoIsAPI {
  base = "https://ipwho.is";

  async fetchIP(ip: string, signal?: AbortSignal): Promise<IPWhoIsResponse> {
    const url = `${this.base}/${encodeURIComponent(ip)}`;
    const res = await fetch(url, { signal });

    if (!res.ok) throw new Error(`Network error: ${res.status}`);

    return (await res.json()) as IPWhoIsResponse;
  }
}

const api = new IPWhoIsAPI();

// -------- Component --------
export default function IPInfoPopup({ ip }: { ip: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IPWhoIsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openAndFetch = async () => {
    setOpen(true);
    setError(null);
    setLoading(true);
    setData(null);

    const ctr = new AbortController();
    const timeout = setTimeout(() => ctr.abort(), 10000);

    try {
      const d = await api.fetchIP(ip.toString(), ctr.signal);
      setData(d);
    } catch (e: any) {
      if (e.name === "AbortError") setError("Request timed out");
      else setError(e.message || "Failed to fetch");
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
    setLoading(false);
    setError(null);
  };

  return (
    <div className="relative inline-block">
      {/* ==== IP Address UI ==== */}
      <div className="flex items-center gap-3 bg-[#0b1220] p-3 rounded-xl shadow-glow border border-[#173046] text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-[#7ee7d6]">IP ADDRESS</span>
          <span className="font-medium text-white">{ip}</span>
          {}
        </div>

        <button
          onClick={openAndFetch}
          className="ml-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#3fe1c7] to-[#7ef3ff]
                     text-[#042023] font-semibold hover:scale-105 transform transition-all duration-150 shadow-sm"
        >
          Get more IP info
        </button>
      </div>

      {/* ==== Popup ==== */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          <div className="relative z-10 max-w-md w-full mx-4">
            <div className="rounded-2xl p-5 bg-[#07111a] border border-[#15313a] shadow-neon">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#7ee7d6]">IP Details</h3>
                  <p className="text-xs text-[#9ecbd0] mt-1">
                    Details for{" "}
                    <span className="font-semibold text-white">{ip}</span>
                  </p>
                </div>

                <button
                  onClick={close}
                  className="ml-2 p-1 rounded-full hover:bg-white/5 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6L18 18M6 18L18 6"
                      stroke="#cceff0"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-4">
                {/* Loading */}
                {loading && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border-4 border-t-transparent animate-spin" />
                    <div className="text-sm text-[#b7e7e0]">
                      Fetching location & ISP info…
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mt-3 p-3 rounded-lg bg-[#3d1f1f] text-sm text-[#ffd6d6]">
                    {error}
                  </div>
                )}

                {/* Data */}
                {data && (
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {/* Flag + Location */}
                    <div className="flex items-center gap-3">
                      {data.flag?.img && (
                        <img
                          src={data.flag.img}
                          alt={data.country || "Flag"}
                          className="w-9 h-6 rounded-sm shadow"
                        />
                      )}
                      <div>
                        <div className="text-sm text-[#9feee0] font-semibold">
                          {data.city ?? "Unknown city"},{" "}
                          {data.region ?? data.country}
                        </div>
                        <div className="text-xs text-[#b7e7e0]">
                          {data.country} • {data.continent}
                        </div>
                      </div>
                    </div>

                    {/* Small Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      <SmallCard
                        label="Latitude"
                        value={data.latitude?.toFixed(5) ?? "—"}
                      />
                      <SmallCard
                        label="Longitude"
                        value={data.longitude?.toFixed(5) ?? "—"}
                      />
                      <SmallCard label="Postal" value={data.postal ?? "—"} />
                      <SmallCard
                        label="Calling"
                        value={data.calling_code ? `+${data.calling_code}` : "—"}
                      />
                    </div>

                    {/* Connection */}
                    <div className="mt-2">
                      <h4 className="text-xs text-[#7ee7d6] font-semibold">
                        Connection
                      </h4>
                      <div className="text-sm text-[#d9f8f3] mt-1">
                        {data.connection?.isp ??
                          data.connection?.org ??
                          "—"}
                      </div>
                      <div className="text-xs text-[#a6e9df] mt-1">
                        ASN: {data.connection?.asn ?? "—"} • Domain:{" "}
                        {data.connection?.domain ?? "—"}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="mt-2">
                      <h4 className="text-xs text-[#7ee7d6] font-semibold">
                        Time
                      </h4>
                      <div className="text-sm text-[#d9f8f3] mt-1">
                        {data.timezone?.current_time ??
                          data.timezone?.utc ??
                          "—"}
                      </div>
                      <div className="text-xs text-[#a6e9df] mt-1">
                        Timezone: {data.timezone?.id ?? "—"} (
                        {data.timezone?.abbr ?? "—"})
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-3 flex gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-md text-sm bg-white/5 hover:bg-white/10 border border-[#1b3a40]"
                      >
                        View on map
                      </a>

                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            JSON.stringify(data, null, 2)
                          )
                        }
                        className="px-3 py-1 rounded-md text-sm bg-white/5 hover:bg-white/10 border border-[#1b3a40]"
                      >
                        Copy JSON
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty */}
                {!loading && !error && !data && (
                  <div className="mt-3 text-sm text-[#9ecbd0]">
                    Click the button again to refresh data if it didn't load.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmallCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-md bg-[#082027] border border-[#0f3a3d]">
      <div className="text-xs text-[#7ee7d6]">{label}</div>
      <div className="text-sm font-medium text-white">{value}</div>
    </div>
  );
}
