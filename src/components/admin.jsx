import React, { useEffect, useMemo, useState } from "react";
import { CONTENT_SECTIONS, normalizeSiteContent } from "../content.js";

const TOKEN_KEY = "greg-admin-token";
const ORDER_STATUSES = ["new", "processing", "shipped", "cancelled", "refunded"];

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState("orders");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) throw new Error(data.error || "Unable to log in.");
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setPassword("");
    } catch (err) {
      setLoginError(err.message || "Unable to log in.");
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  };

  if (!token) {
    return (
      <div className="admin-login">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <div className="admin-login-mark">GP</div>
          <div>
            <p className="admin-kicker">Admin</p>
            <h1>Greg Pryor site console</h1>
            <p className="admin-login-copy">Manage orders, fulfillment notes, tracking, and live site copy.</p>
          </div>
          <label className="admin-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
            />
          </label>
          {loginError && <div className="admin-alert">{loginError}</div>}
          <button className="admin-primary" disabled={loggingIn || !password}>
            {loggingIn ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div>
          <p className="admin-kicker">Greg Pryor</p>
          <h1>Admin</h1>
        </div>
        <div className="admin-top-actions">
          <button className={tab === "orders" ? "is-active" : ""} onClick={() => setTab("orders")}>Orders</button>
          <button className={tab === "copy" ? "is-active" : ""} onClick={() => setTab("copy")}>Site copy</button>
          <a href="/" target="_blank" rel="noopener noreferrer">View site</a>
          <button onClick={logout}>Sign out</button>
        </div>
      </header>

      {tab === "orders" ? <OrdersAdmin token={token} onAuthExpired={logout} /> : <CopyAdmin token={token} onAuthExpired={logout} />}
    </div>
  );
}

function CopyAdmin({ token, onAuthExpired }) {
  const [content, setContent] = useState(() => normalizeSiteContent({}));
  const [activeSection, setActiveSection] = useState(CONTENT_SECTIONS[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({ source: "", canSave: false, repo: "", branch: "", path: "" });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminFetch("/api/admin/content", { token, onAuthExpired });
      setContent(normalizeSiteContent(data.content || {}));
      setMeta({
        source: data.source || "",
        canSave: !!data.canSave,
        repo: data.repo || "",
        branch: data.branch || "",
        path: data.path || "",
      });
    } catch (err) {
      setError(err.message || "Unable to load content.");
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const data = await adminFetch("/api/admin/content", {
        token,
        onAuthExpired,
        method: "PUT",
        body: JSON.stringify({ content }),
      });
      setContent(normalizeSiteContent(data.content || content));
      setStatus(data.url ? `Saved to main. Commit: ${data.commit?.slice(0, 7)}` : "Saved.");
    } catch (err) {
      setError(err.message || "Unable to save content.");
    } finally {
      setSaving(false);
    }
  };

  const section = CONTENT_SECTIONS.find((s) => s.id === activeSection) || CONTENT_SECTIONS[0];

  return (
    <main className="admin-grid admin-copy-grid">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Sections</div>
        {CONTENT_SECTIONS.map((s) => (
          <button
            key={s.id}
            className={s.id === activeSection ? "is-active" : ""}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </aside>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <p className="admin-kicker">Copy editor</p>
            <h2>{section.label}</h2>
            <p className="admin-muted">
              Source: {meta.source || "default"} · {meta.repo ? `${meta.repo}:${meta.branch}` : "repository not configured"}
            </p>
          </div>
          <div className="admin-actions">
            <button className="admin-ghost" onClick={loadContent} disabled={loading}>Reload</button>
            <button className="admin-primary" onClick={saveContent} disabled={saving || loading || !meta.canSave}>
              {saving ? "Saving..." : "Save copy"}
            </button>
          </div>
        </div>

        {!meta.canSave && !loading && (
          <div className="admin-note">
            Saving is disabled until <code>GITHUB_ADMIN_TOKEN</code> is set in Cloudflare. The editor can still preview the current copy here.
          </div>
        )}
        {status && <div className="admin-success">{status}. Cloudflare will deploy the updated copy from main.</div>}
        {error && <div className="admin-alert">{error}</div>}

        <div className="admin-form-grid" aria-busy={loading}>
          {section.fields.map(([path, label, type]) => (
            <CopyField
              key={path}
              path={path}
              label={label}
              type={type}
              content={content}
              onChange={(next) => setContent((current) => setPath(current, path, next))}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function CopyField({ path, label, type, content, onChange }) {
  const value = getPath(content, path);
  const stringValue = type === "lines"
    ? (Array.isArray(value) ? value.join("\n") : "")
    : String(value ?? "");

  const handleChange = (e) => {
    if (type === "lines") {
      onChange(e.target.value.split("\n").map((line) => line.trim()).filter(Boolean));
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <label className={`admin-field ${type === "textarea" || type === "lines" ? "admin-field-wide" : ""}`}>
      <span>{label}</span>
      {type === "textarea" || type === "lines" ? (
        <textarea rows={type === "lines" ? 7 : Math.min(9, Math.max(3, Math.ceil(stringValue.length / 80)))} value={stringValue} onChange={handleChange} />
      ) : (
        <input type="text" value={stringValue} onChange={handleChange} />
      )}
    </label>
  );
}

function OrdersAdmin({ token, onAuthExpired }) {
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminFetch("/api/admin/orders", { token, onAuthExpired });
      setOrders(data.orders || []);
      setSelectedId((current) => current || data.orders?.[0]?.id || "");
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const statusOk = statusFilter === "all" || order.fulfillment.status === statusFilter;
      const haystack = [
        order.id,
        order.customer.name,
        order.customer.email,
        order.customer.phone,
        order.address.city,
        order.address.state,
        order.items.recipient,
      ].join(" ").toLowerCase();
      return statusOk && (!q || haystack.includes(q));
    });
  }, [orders, query, statusFilter]);

  const selected = orders.find((o) => o.id === selectedId) || filteredOrders[0] || null;

  const saveFulfillment = async (order, fulfillment) => {
    setSaving(true);
    setError("");
    try {
      const data = await adminFetch("/api/admin/orders", {
        token,
        onAuthExpired,
        method: "PATCH",
        body: JSON.stringify({ id: order.id, ...fulfillment }),
      });
      setOrders((current) => current.map((item) => item.id === data.order.id ? data.order : item));
      setSelectedId(data.order.id);
    } catch (err) {
      setError(err.message || "Unable to save order.");
    } finally {
      setSaving(false);
    }
  };

  const counts = orders.reduce((acc, order) => {
    const key = order.fulfillment.status || "new";
    acc[key] = (acc[key] || 0) + 1;
    acc.all += 1;
    return acc;
  }, { all: 0 });

  return (
    <main className="admin-grid admin-orders-grid">
      <section className="admin-panel admin-order-list-panel">
        <div className="admin-panel-head">
          <div>
            <p className="admin-kicker">Orders</p>
            <h2>{counts.all} total</h2>
          </div>
          <button className="admin-ghost" onClick={loadOrders} disabled={loading}>Refresh</button>
        </div>

        <div className="admin-filters">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, city, recipient"
          />
          <div className="admin-status-row">
            {["all", ...ORDER_STATUSES].map((status) => (
              <button
                key={status}
                className={statusFilter === status ? "is-active" : ""}
                onClick={() => setStatusFilter(status)}
              >
                {status} <span>{counts[status] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="admin-alert">{error}</div>}
        {loading ? (
          <div className="admin-empty">Loading Stripe orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty">No orders match this view.</div>
        ) : (
          <div className="admin-order-list">
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                className={`admin-order-row ${selected?.id === order.id ? "is-active" : ""}`}
                onClick={() => setSelectedId(order.id)}
              >
                <span className={`admin-pill admin-pill-${order.fulfillment.status}`}>{order.fulfillment.status}</span>
                <strong>{order.customer.name || "Unnamed order"}</strong>
                <span>{order.customer.email || order.id}</span>
                <span>{formatMoney(order.amount, order.currency)} · {formatDate(order.createdAt)}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="admin-panel admin-order-detail-panel">
        {selected ? (
          <OrderDetail order={selected} saving={saving} onSave={saveFulfillment} />
        ) : (
          <div className="admin-empty">Select an order to see the full details.</div>
        )}
      </section>
    </main>
  );
}

function OrderDetail({ order, saving, onSave }) {
  const [fulfillment, setFulfillment] = useState(order.fulfillment);

  useEffect(() => {
    setFulfillment(order.fulfillment);
  }, [
    order.id,
    order.fulfillment.status,
    order.fulfillment.trackingNumber,
    order.fulfillment.carrier,
    order.fulfillment.notes,
    order.fulfillment.shippedAt,
  ]);

  const update = (key) => (e) => setFulfillment((f) => ({ ...f, [key]: e.target.value }));
  const setStatus = (status) => setFulfillment((f) => ({
    ...f,
    status,
    shippedAt: status === "shipped" && !f.shippedAt ? new Date().toISOString() : f.shippedAt,
  }));
  const markShipped = () => {
    const next = {
      ...fulfillment,
      status: "shipped",
      shippedAt: fulfillment.shippedAt || new Date().toISOString(),
    };
    setFulfillment(next);
    onSave(order, next);
  };
  const stripePaymentUrl = `https://dashboard.stripe.com/payments/${order.id}`;
  const openPackingSlip = () => {
    window.print();
  };

  return (
    <div className="admin-order-detail">
      <div className="admin-panel-head">
        <div>
          <p className="admin-kicker">{order.id}</p>
          <h2>{order.customer.name || "Order"}</h2>
          <p className="admin-muted">{formatDateTime(order.createdAt)} · Stripe: {order.stripeStatus}</p>
        </div>
        <div className="admin-actions">
          <button className="admin-ghost" onClick={openPackingSlip}>Print packing slip</button>
          <a className="admin-ghost-link" href={stripePaymentUrl} target="_blank" rel="noopener noreferrer">Open Stripe</a>
        </div>
      </div>

      <div className="admin-detail-grid">
        <InfoCard title="Contact">
          <p><strong>{order.customer.name || "-"}</strong></p>
          <p>{order.customer.email || "-"}</p>
          <p>{order.customer.phone || "No phone collected"}</p>
        </InfoCard>

        <InfoCard title="Ship To">
          <p>{order.address.line1 || "-"}</p>
          {order.address.line2 && <p>{order.address.line2}</p>}
          <p>{[order.address.city, order.address.state, order.address.postalCode].filter(Boolean).join(", ") || "-"}</p>
          <p>{order.address.country || "US"}</p>
        </InfoCard>

        <InfoCard title="Items">
          <p><strong>{editionLabel(order.items.edition)}</strong> x {order.items.quantity}</p>
          {order.items.addBall && <p>Signed MLB ball add-on</p>}
          <p>Shipping: {order.items.shipMethod}</p>
        </InfoCard>

        <InfoCard title="Totals">
          <p>Subtotal: {formatMoney(order.totals.subtotal, order.currency)}</p>
          <p>Shipping: {formatMoney(order.totals.shipping, order.currency)}</p>
          <p>Tax: {formatMoney(order.totals.tax, order.currency)}</p>
          <p><strong>Total: {formatMoney(order.totals.total || order.amount, order.currency)}</strong></p>
        </InfoCard>
      </div>

      <div className="admin-info-card admin-wide-card">
        <h3>Payment, Refunds & Cancellation</h3>
        <div className="admin-payment-grid">
          <div>
            <p><strong>{formatMoney(order.amount, order.currency)}</strong> paid through Stripe</p>
            <p>Payment method: {prettyPaymentMethod(order.payment?.method || order.paymentMethod) || "-"}</p>
            <p>Refunded: {formatMoney(order.payment?.amountRefunded || 0, order.currency)}</p>
            {order.payment?.failureMessage && <p className="admin-danger-text">{order.payment.failureMessage}</p>}
          </div>
          <div className="admin-payment-actions">
            {order.receiptUrl && <a className="admin-ghost-link" href={order.receiptUrl} target="_blank" rel="noopener noreferrer">View receipt</a>}
            <a className="admin-ghost-link" href={stripePaymentUrl} target="_blank" rel="noopener noreferrer">Refund in Stripe</a>
          </div>
        </div>
        <p className="admin-muted admin-note-inline">
          Refunds and payment cancellations are intentionally handled in Stripe so money movement has Stripe's confirmation screens and audit trail. Changing status here does not notify the customer.
        </p>
      </div>

      <div className="admin-info-card admin-wide-card">
        <h3>Personalization</h3>
        <dl className="admin-dl">
          <div><dt>Recipient</dt><dd>{order.items.recipient || "-"}</dd></div>
          <div><dt>Book inscription</dt><dd>{order.items.inscription || "-"}</dd></div>
          <div><dt>Ball inscription</dt><dd>{order.items.ballInscription || "-"}</dd></div>
        </dl>
      </div>

      <div className="admin-info-card admin-wide-card">
        <h3>Fulfillment</h3>
        <div className="admin-status-row admin-status-row-large">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              className={fulfillment.status === status ? "is-active" : ""}
              onClick={() => setStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="admin-form-grid admin-fulfillment-grid">
          <label className="admin-field">
            <span>Carrier</span>
            <input value={fulfillment.carrier || ""} onChange={update("carrier")} placeholder="USPS, UPS, FedEx" />
          </label>
          <label className="admin-field">
            <span>Tracking number</span>
            <input value={fulfillment.trackingNumber || ""} onChange={update("trackingNumber")} />
          </label>
          <label className="admin-field admin-field-wide">
            <span>Internal notes</span>
            <textarea rows={4} value={fulfillment.notes || ""} onChange={update("notes")} />
          </label>
        </div>
        {fulfillment.shippedAt && <p className="admin-muted">Shipped at: {formatDateTime(fulfillment.shippedAt)}</p>}
        {fulfillment.updatedAt && <p className="admin-muted">Last fulfillment update: {formatDateTime(fulfillment.updatedAt)}</p>}
        <div className="admin-actions">
          <button className="admin-ghost" disabled={saving} onClick={markShipped}>Mark shipped</button>
          <button className="admin-primary" disabled={saving} onClick={() => onSave(order, fulfillment)}>
            {saving ? "Saving..." : "Save fulfillment"}
          </button>
        </div>
      </div>

      <div className="admin-info-card admin-wide-card">
        <h3>Internal Timeline</h3>
        <OrderTimeline order={order} fulfillment={fulfillment} />
      </div>

      <PackingSlip order={order} fulfillment={fulfillment} />
    </div>
  );
}

function OrderTimeline({ order, fulfillment }) {
  const events = [
    { label: "Order created", detail: order.description || order.id, at: order.createdAt },
    { label: "Payment status", detail: order.payment?.paid ? "Paid in Stripe" : order.stripeStatus, at: order.createdAt },
    fulfillment.updatedAt ? { label: "Fulfillment updated", detail: `Status: ${fulfillment.status}`, at: fulfillment.updatedAt } : null,
    fulfillment.shippedAt ? { label: "Marked shipped", detail: [fulfillment.carrier, fulfillment.trackingNumber].filter(Boolean).join(" ") || "No tracking entered", at: fulfillment.shippedAt } : null,
    order.payment?.amountRefunded ? { label: "Refund recorded in Stripe", detail: formatMoney(order.payment.amountRefunded, order.currency), at: "" } : null,
  ].filter(Boolean);

  return (
    <ol className="admin-timeline">
      {events.map((event, index) => (
        <li key={`${event.label}-${index}`}>
          <span className="admin-timeline-dot" aria-hidden />
          <div>
            <strong>{event.label}</strong>
            <p>{event.detail}</p>
            {event.at && <time>{formatDateTime(event.at)}</time>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function PackingSlip({ order, fulfillment }) {
  return (
    <div className="admin-print-area" aria-hidden="true">
      <section className="packing-slip">
        <header>
          <div>
            <p className="packing-kicker">Greg Pryor Orders</p>
            <h1>Packing Slip</h1>
          </div>
          <div className="packing-order-id">
            <span>Order</span>
            <strong>{order.id}</strong>
            <span>{formatDateTime(order.createdAt)}</span>
          </div>
        </header>

        <div className="packing-grid">
          <div>
            <h2>Ship To</h2>
            <p><strong>{order.customer.name || "-"}</strong></p>
            <p>{order.address.line1 || "-"}</p>
            {order.address.line2 && <p>{order.address.line2}</p>}
            <p>{[order.address.city, order.address.state, order.address.postalCode].filter(Boolean).join(", ") || "-"}</p>
            <p>{order.address.country || "US"}</p>
          </div>
          <div>
            <h2>Contact</h2>
            <p>{order.customer.email || "-"}</p>
            <p>{order.customer.phone || "No phone collected"}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Qty</th>
              <th>Item</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{order.items.quantity}</td>
              <td>{editionLabel(order.items.edition)}</td>
              <td>{order.items.recipient ? `To ${order.items.recipient}` : "No recipient entered"}</td>
            </tr>
            {order.items.addBall && (
              <tr>
                <td>1</td>
                <td>Signed MLB ball</td>
                <td>{order.items.ballInscription || "No ball inscription"}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="packing-notes">
          <h2>Personalization</h2>
          <p><strong>Book inscription:</strong> {order.items.inscription || "-"}</p>
          <p><strong>Ball inscription:</strong> {order.items.ballInscription || "-"}</p>
          <p><strong>Shipping method:</strong> {order.items.shipMethod}</p>
          <p><strong>Carrier/tracking:</strong> {[fulfillment.carrier, fulfillment.trackingNumber].filter(Boolean).join(" ") || "-"}</p>
          {fulfillment.notes && <p><strong>Internal notes:</strong> {fulfillment.notes}</p>}
        </div>

        <footer>
          <span>Status: {fulfillment.status}</span>
          <span>Total paid: {formatMoney(order.totals.total || order.amount, order.currency)}</span>
        </footer>
      </section>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="admin-info-card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

async function adminFetch(path, { token, onAuthExpired, method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    onAuthExpired?.();
    throw new Error(data.error || "Admin session expired.");
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function getPath(obj, path) {
  return path.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function setPath(obj, path, value) {
  const parts = path.split(".");
  const root = Array.isArray(obj) ? [...obj] : { ...obj };
  let cursor = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const nextKey = parts[i + 1];
    const existing = cursor[key];
    cursor[key] = Array.isArray(existing)
      ? [...existing]
      : existing && typeof existing === "object"
        ? { ...existing }
        : /^\d+$/.test(nextKey) ? [] : {};
    cursor = cursor[key];
  }
  cursor[parts[parts.length - 1]] = value;
  return root;
}

function formatMoney(cents, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format((cents || 0) / 100);
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function editionLabel(edition) {
  if (edition === "standard") return "Hardcover, unsigned";
  if (edition === "signed") return "Hardcover, signed";
  return edition || "Book";
}

function prettyPaymentMethod(method) {
  if (!method) return "";
  return method
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const adminStyles = document.createElement("style");
adminStyles.textContent = `
.admin-shell,
.admin-login {
  min-height: 100vh;
  background: #07101d;
  color: var(--bone);
  font-family: var(--sans);
}
.admin-login {
  display: grid;
  place-items: center;
  padding: 24px;
}
.admin-login-card {
  width: min(440px, 100%);
  border: 1px solid rgba(189, 155, 96, 0.24);
  background: #0d1a2e;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 30px 90px -40px rgba(0, 0, 0, 0.8);
}
.admin-login-mark {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--royal-blue);
  border: 1px solid var(--royal-blue-glow);
  font-family: var(--mono);
  font-size: 13px;
  margin-bottom: 24px;
}
.admin-login h1,
.admin-topbar h1,
.admin-panel h2 {
  margin: 0;
  font-family: var(--serif);
  font-weight: 500;
  letter-spacing: 0;
}
.admin-login h1 { font-size: 30px; }
.admin-login-copy,
.admin-muted {
  color: rgba(232, 227, 214, 0.68);
  margin: 6px 0 0;
}
.admin-kicker {
  margin: 0 0 6px;
  color: var(--gold);
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}
.admin-topbar {
  min-height: 76px;
  border-bottom: 1px solid rgba(189, 155, 96, 0.2);
  background: rgba(5, 13, 26, 0.82);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 28px;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(14px);
}
.admin-topbar h1 { font-size: 28px; }
.admin-top-actions,
.admin-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.admin-top-actions button,
.admin-top-actions a,
.admin-ghost,
.admin-primary,
.admin-ghost-link {
  border: 1px solid rgba(189, 155, 96, 0.28);
  background: transparent;
  color: var(--bone-dim);
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  text-decoration: none;
}
.admin-top-actions button.is-active,
.admin-status-row button.is-active,
.admin-sidebar button.is-active {
  background: rgba(43, 138, 255, 0.14);
  color: var(--bone);
  border-color: var(--royal-blue-glow);
}
.admin-primary {
  background: var(--gold);
  color: var(--navy-900);
  border-color: var(--gold);
  font-weight: 600;
}
.admin-primary:disabled,
.admin-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.admin-grid {
  display: grid;
  gap: 18px;
  padding: 18px;
}
.admin-copy-grid {
  grid-template-columns: 240px minmax(0, 1fr);
}
.admin-orders-grid {
  grid-template-columns: minmax(360px, 0.85fr) minmax(0, 1.35fr);
  align-items: start;
}
.admin-sidebar,
.admin-panel {
  border: 1px solid rgba(189, 155, 96, 0.2);
  background: rgba(13, 26, 46, 0.82);
  border-radius: 8px;
}
.admin-sidebar {
  padding: 14px;
  position: sticky;
  top: 96px;
}
.admin-sidebar-title {
  color: var(--bone-dim);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 8px 10px 12px;
}
.admin-sidebar button {
  width: 100%;
  text-align: left;
  display: block;
  background: transparent;
  border: 1px solid transparent;
  color: var(--bone-dim);
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
}
.admin-panel {
  padding: 22px;
  min-width: 0;
}
.admin-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(189, 155, 96, 0.18);
  margin-bottom: 18px;
}
.admin-panel h2 { font-size: 28px; }
.admin-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.admin-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.admin-field-wide {
  grid-column: 1 / -1;
}
.admin-field span {
  color: var(--gold);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.admin-field input,
.admin-field textarea,
.admin-filters input {
  width: 100%;
  border: 1px solid rgba(189, 155, 96, 0.22);
  background: rgba(0, 0, 0, 0.24);
  color: var(--bone);
  border-radius: 6px;
  padding: 12px 13px;
  font: inherit;
  outline: none;
}
.admin-field textarea {
  resize: vertical;
  line-height: 1.45;
}
.admin-field input:focus,
.admin-field textarea:focus,
.admin-filters input:focus {
  border-color: var(--royal-blue-glow);
}
.admin-note,
.admin-alert,
.admin-success {
  padding: 12px 14px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 13px;
}
.admin-note {
  background: rgba(43, 138, 255, 0.08);
  border: 1px solid rgba(43, 138, 255, 0.3);
  color: var(--bone-dim);
}
.admin-alert {
  background: rgba(200, 16, 46, 0.12);
  border: 1px solid rgba(200, 16, 46, 0.45);
  color: #ffd1d9;
}
.admin-success {
  background: rgba(50, 160, 100, 0.11);
  border: 1px solid rgba(50, 160, 100, 0.4);
  color: #c9f4dc;
}
.admin-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.admin-status-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.admin-status-row button {
  border: 1px solid rgba(189, 155, 96, 0.22);
  background: rgba(255, 255, 255, 0.02);
  color: var(--bone-dim);
  border-radius: 999px;
  padding: 8px 11px;
  cursor: pointer;
  text-transform: capitalize;
  font-size: 12px;
}
.admin-status-row span {
  color: var(--gold);
  margin-left: 4px;
}
.admin-status-row-large { margin-bottom: 18px; }
.admin-order-list {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  gap: 8px;
  max-height: calc(100vh - 280px);
  overflow: auto;
  padding-right: 4px;
}
.admin-order-row {
  border: 1px solid rgba(189, 155, 96, 0.16);
  background: rgba(0, 0, 0, 0.16);
  color: var(--bone-dim);
  border-radius: 7px;
  padding: 13px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 10px;
  text-align: left;
  cursor: pointer;
}
.admin-order-row.is-active {
  border-color: var(--royal-blue-glow);
  background: rgba(43, 138, 255, 0.08);
}
.admin-order-row strong {
  color: var(--bone);
}
.admin-order-row span:nth-child(3),
.admin-order-row span:nth-child(4) {
  grid-column: 2;
  font-size: 12px;
}
.admin-pill {
  align-self: start;
  border-radius: 999px;
  padding: 4px 8px;
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid rgba(189, 155, 96, 0.24);
}
.admin-pill-new { color: #ffd978; }
.admin-pill-processing { color: #93c5ff; }
.admin-pill-shipped { color: #9ef0bd; }
.admin-pill-cancelled,
.admin-pill-refunded { color: #ffb0bd; }
.admin-empty {
  padding: 28px;
  color: var(--bone-dim);
  text-align: center;
}
.admin-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.admin-info-card {
  border: 1px solid rgba(189, 155, 96, 0.18);
  background: rgba(0, 0, 0, 0.14);
  border-radius: 7px;
  padding: 16px;
}
.admin-wide-card {
  margin-top: 14px;
}
.admin-info-card h3 {
  margin: 0 0 10px;
  color: var(--gold);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.admin-info-card p {
  margin: 4px 0;
  color: var(--bone-dim);
}
.admin-payment-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: start;
}
.admin-payment-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.admin-danger-text {
  color: #ffb0bd !important;
}
.admin-note-inline {
  border-top: 1px solid rgba(189, 155, 96, 0.16);
  padding-top: 12px;
  margin-top: 12px;
}
.admin-dl {
  display: grid;
  gap: 12px;
  margin: 0;
}
.admin-dl div {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 14px;
}
.admin-dl dt {
  color: var(--gold);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.admin-dl dd {
  margin: 0;
  color: var(--bone-dim);
  white-space: pre-wrap;
}
.admin-fulfillment-grid {
  margin-top: 4px;
}
.admin-timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 14px;
}
.admin-timeline li {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 12px;
  position: relative;
}
.admin-timeline li:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 5px;
  top: 18px;
  bottom: -14px;
  width: 1px;
  background: rgba(189, 155, 96, 0.22);
}
.admin-timeline-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--royal-blue-glow);
  margin-top: 5px;
  box-shadow: 0 0 0 3px rgba(43, 138, 255, 0.12);
}
.admin-timeline strong {
  display: block;
  color: var(--bone);
  font-size: 14px;
}
.admin-timeline p {
  margin: 2px 0;
}
.admin-timeline time {
  color: rgba(232, 227, 214, 0.58);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.08em;
}
.admin-print-area {
  display: none;
}
.packing-slip {
  color: #111827;
  background: #fff;
  font-family: Arial, Helvetica, sans-serif;
  padding: 0;
}
.packing-slip header,
.packing-slip footer {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  border-bottom: 2px solid #111827;
  padding-bottom: 18px;
  margin-bottom: 22px;
}
.packing-slip footer {
  border-top: 2px solid #111827;
  border-bottom: 0;
  padding-top: 14px;
  margin: 24px 0 0;
  font-weight: 700;
}
.packing-kicker {
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  color: #4b5563;
}
.packing-slip h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
}
.packing-slip h2 {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  color: #374151;
}
.packing-slip p {
  margin: 3px 0;
  color: #111827;
}
.packing-order-id {
  text-align: right;
  display: grid;
  gap: 3px;
  font-size: 12px;
}
.packing-order-id span {
  color: #4b5563;
}
.packing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  margin-bottom: 24px;
}
.packing-slip table {
  width: 100%;
  border-collapse: collapse;
  margin: 18px 0 24px;
}
.packing-slip th,
.packing-slip td {
  border: 1px solid #d1d5db;
  padding: 10px;
  text-align: left;
  vertical-align: top;
}
.packing-slip th {
  background: #f3f4f6;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
}
.packing-notes {
  border: 1px solid #d1d5db;
  padding: 14px;
}
@media (max-width: 980px) {
  .admin-copy-grid,
  .admin-orders-grid {
    grid-template-columns: 1fr;
  }
  .admin-sidebar {
    position: static;
  }
  .admin-topbar,
  .admin-panel-head {
    flex-direction: column;
  }
  .admin-form-grid,
  .admin-detail-grid {
    grid-template-columns: 1fr;
  }
  .admin-order-list {
    max-height: none;
  }
}
@media (max-width: 680px) {
  .admin-payment-grid {
    grid-template-columns: 1fr;
  }
  .admin-payment-actions {
    justify-content: flex-start;
  }
}
@media print {
  @page {
    margin: 0.5in;
  }
  body {
    background: #fff !important;
  }
  body * {
    visibility: hidden !important;
  }
  .admin-print-area,
  .admin-print-area * {
    visibility: visible !important;
  }
  .admin-print-area {
    display: block !important;
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    background: #fff;
  }
  .packing-slip {
    display: block;
  }
}
`;
document.head.appendChild(adminStyles);
