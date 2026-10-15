import React, { useEffect, useState } from "react";

const examples = [
  {
    id: "revalidate",
    title: "Revalidate every time",
    header: "public, max-age=0, must-revalidate",
    detail: "The browser considers its cached response stale immediately. It can send a conditional request; a 304 response lets it reuse the stored body."
  },
  {
    id: "oneYear",
    title: "One-year immutable asset",
    header: "public, max-age=31536000, immutable",
    detail: "The browser can reuse the response for one year without revalidation while it is fresh. Use only when the URL changes whenever the content changes."
  },
  {
    id: "cdnSevenDays",
    title: "Browser revalidation + CDN freshness",
    header: "public, max-age=0, s-maxage=604800, must-revalidate",
    detail: "Browser freshness is zero; a compliant shared cache can treat the response as fresh for seven days. Actual CDN behavior depends on the hosting platform."
  },
  {
    id: "sharedOneYear",
    title: "Shared-cache max age only",
    header: "public, s-maxage=31536000",
    detail: "This sets a one-year freshness lifetime for shared caches. It does not explicitly set the browser's max-age."
  }
];

function Pill({ children }) {
  return <span className="pill">{children}</span>;
}

export default function App() {
  const [assets, setAssets] = useState([]);
  const [policies, setPolicies] = useState({});
  const [selected, setSelected] = useState("index-yjSJye8M.js");
  const [policy, setPolicy] = useState("oneYear");
  const [dynamicVersion, setDynamicVersion] = useState("1");
  const [dynamicPolicy, setDynamicPolicy] = useState("revalidate");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/assets")
      .then((r) => r.json())
      .then((data) => {
        setAssets(data.assets || []);
        setPolicies(data.policies || {});
      })
      .catch(() => setError("Could not reach the demo server. Run npm run dev."));
  }, []);

  async function inspectDynamic() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/dynamic?version=${dynamicVersion}&policy=${dynamicPolicy}`, {
        cache: "no-cache"
      });
      const headers = Object.fromEntries(r.headers.entries());
      let body = null;
      if (r.status !== 304) body = await r.json();
      setResponse({ status: r.status, headers, body });
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  const selectedAsset = assets.find((a) => a.name === selected);
  const currentPolicy = policies[policy] || "";

  return (
    <main className="page">
      <header className="hero">
        <div className="eyebrow">LEARN BY INSPECTING REAL HTTP RESPONSES</div>
        <h1>Cache-Control <span>Playground</span></h1>
        <p>Explore browser caching, CDN freshness, immutable assets, validators, and the rules a multi-framework host can apply to static files.</p>
        <div className="hero-tags"><Pill>React + Express</Pill><Pill>HTTP headers</Pill><Pill>DevTools lab</Pill></div>
      </header>

      <section className="section">
        <div className="section-heading">
          <div><div className="eyebrow">01 / HEADER RECIPES</div><h2>Compare cache policies</h2></div>
          <p>These are response-header values. They must be sent by the server or hosting layer.</p>
        </div>
        <div className="policy-grid">
          {examples.map((item) => (
            <article className={`policy-card ${policy === item.id ? "selected" : ""}`} key={item.id}>
              <div className="card-top"><h3>{item.title}</h3><button className="small-button" onClick={() => setPolicy(item.id)}>Inspect</button></div>
              <code>{item.header}</code>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
        <div className="selected-policy">
          <div><span className="muted-label">Selected server policy</span><code>{currentPolicy}</code></div>
          <Pill>{policy}</Pill>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><div className="eyebrow">02 / STATIC ASSETS</div><h2>Asset policy inspector</h2></div>
          <p>The demo uses an explicit manifest. It does not assume that every filename containing a hash is immutable.</p>
        </div>
        <div className="inspector-layout">
          <div className="asset-list">
            {assets.map((asset) => (
              <button className={`asset-row ${selected === asset.name ? "active" : ""}`} key={asset.name} onClick={() => { setSelected(asset.name); setPolicy(asset.policy); }}>
                <span className="file-icon">{asset.name.endsWith(".css") ? "CSS" : asset.name.endsWith(".js") ? "JS" : asset.name.endsWith(".svg") ? "SVG" : "HTML"}</span>
                <span className="asset-name"><strong>{asset.name}</strong><small>{asset.kind}</small></span>
                <span className={`status ${asset.immutable ? "immutable" : ""}`}>{asset.immutable ? "IMMUTABLE" : "REVALIDATE"}</span>
              </button>
            ))}
          </div>
          <div className="asset-detail">
            <div className="detail-header"><div><span className="muted-label">Selected object</span><h3>{selectedAsset?.name || "Choose an asset"}</h3></div><Pill>{selectedAsset?.policy || "—"}</Pill></div>
            <div className="detail-row"><span>Request path</span><code>{selectedAsset?.url || "—"}</code></div>
            <div className="detail-row"><span>Cache-Control</span><code>{policies[selectedAsset?.policy] || "—"}</code></div>
            <div className="detail-row"><span>Classification source</span><strong>{selectedAsset?.immutable ? "Trusted demo manifest" : "Conservative fallback / revalidation"}</strong></div>
            {selectedAsset && <a className="primary-button" href={selectedAsset.url} target="_blank" rel="noreferrer">Open asset response ↗</a>}
            <p className="hint">Open the asset in a new tab, then inspect Network → Headers. Reload it to see how browser caching behaves. Avoid “Disable cache” and hard reload when testing normal cache reuse.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><div className="eyebrow">03 / VALIDATORS</div><h2>Inspect a dynamic response</h2></div>
          <p>Compare versions and inspect ETag / Last-Modified. A browser may send conditional headers automatically when revalidating a cached response.</p>
        </div>
        <div className="lab">
          <div className="lab-controls">
            <label>Response version<select value={dynamicVersion} onChange={(e) => setDynamicVersion(e.target.value)}><option value="1">Version 1</option><option value="2">Version 2</option></select></label>
            <label>Cache policy<select value={dynamicPolicy} onChange={(e) => setDynamicPolicy(e.target.value)}><option value="revalidate">max-age=0, must-revalidate</option><option value="cdn">s-maxage=604800 (7 days)</option></select></label>
            <button className="primary-button" onClick={inspectDynamic} disabled={loading}>{loading ? "Requesting…" : "Fetch response"}</button>
            <button className="secondary-button" onClick={() => { setResponse(null); setDynamicVersion("1"); }}>Reset view</button>
          </div>
          <div className="lab-result">
            {!response ? <div className="empty-state"><span>↳</span><strong>No response inspected yet</strong><p>Choose a version and fetch it to view the actual response headers.</p></div> :
              <>
                <div className="response-status"><span className={response.status === 304 ? "status-code not-modified" : "status-code"}>{response.status}</span><strong>{response.status === 304 ? "Not Modified" : "OK"}</strong><Pill>HTTP response</Pill></div>
                <h4>Response headers visible to JavaScript</h4>
                <pre>{JSON.stringify(response.headers, null, 2)}</pre>
                {response.body && <><h4>Response body</h4><pre>{JSON.stringify(response.body, null, 2)}</pre></>}
                <p className="hint">Note: browsers often hide some cache internals from JavaScript. DevTools Network is the source of truth for request headers, 304 responses, and memory/disk cache indicators.</p>
              </>
            }
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><div className="eyebrow">04 / HOSTING DESIGN</div><h2>How Slate should classify files</h2></div>
          <p>A safe cross-framework approach for Vite, React, Vue, Angular, Next.js, and custom builds.</p>
        </div>
        <div className="architecture">
          <div className="arch-step"><span>1</span><div><strong>Build output</strong><p>Framework emits files and, ideally, metadata describing content-hashed assets.</p></div></div>
          <div className="arch-arrow">↓</div>
          <div className="arch-step"><span>2</span><div><strong>Trusted asset manifest</strong><p>Record each output path and whether it is content-addressed / immutable. Do not rely on a universal hash regex.</p></div></div>
          <div className="arch-arrow">↓</div>
          <div className="arch-step"><span>3</span><div><strong>Hosting response policy</strong><p>Immutable assets: <code>public, max-age=31536000, immutable</code>. HTML and unknown files: conservative revalidation.</p></div></div>
          <div className="arch-arrow">↓</div>
          <div className="arch-step"><span>4</span><div><strong>CDN behavior + invalidation</strong><p>Define shared-cache TTL separately. Ensure deploys or invalidation prevent stale content at mutable URLs.</p></div></div>
        </div>
      </section>

      {error && <div className="error">{error}</div>}
      <footer><span>Cache-Control Playground</span><span>Use DevTools → Network → Headers to verify the wire response.</span></footer>
    </main>
  );
}
