import { useEffect, useState } from 'react';
import { ApiClient, messageOf, Preferencias } from './api';

const PATH = '/api/v1/preferencias';

const CHANNELS: { key: keyof Preferencias; label: string; note?: string }[] = [
  { key: 'email', label: 'Correo' },
  // DEC-006 of notification: only e-mail is sent in MVP 1; the preference is kept.
  { key: 'sms', label: 'SMS', note: 'Aún no enviamos SMS: guardamos tu preferencia.' },
  { key: 'push', label: 'Notificaciones push', note: 'Aún no enviamos push: guardamos tu preferencia.' },
];

/** /perfil/notificaciones (HU-NOTIF-002): the channels the guest accepts, saved one at a time. */
export function PreferencesScreen({ apiClient }: { apiClient: ApiClient }) {
  const [prefs, setPrefs] = useState<Preferencias | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<keyof Preferencias | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    apiClient.get<Preferencias>(PATH).then(
      (p) => alive && setPrefs(p),
      (err) => alive && setError(messageOf(err)),
    );
    return () => {
      alive = false;
    };
  }, [apiClient]);

  async function change(key: keyof Preferencias, value: boolean) {
    setSaving(key);
    setSaved(false);
    setError(null);
    try {
      setPrefs(await apiClient.patch<Preferencias>(PATH, { [key]: value }));   // partial: E-17
      setSaved(true);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="np-card" aria-labelledby="np-title">
      <style>{STYLES}</style>
      <h1 id="np-title">Notificaciones</h1>
      <p>Te avisamos cuando tu reserva se confirma, se cancela o expira.</p>
      {error && <p role="alert" className="np-error">{error}</p>}
      {!prefs && !error && <p>Cargando…</p>}
      {prefs && (
        <fieldset disabled={saving !== null}>
          <legend>Canales</legend>
          {CHANNELS.map(({ key, label, note }) => (
            <label key={key} className="np-channel">
              <input type="checkbox" name={key} checked={prefs[key]}
                onChange={(e) => void change(key, e.currentTarget.checked)} />
              <span>{label}</span>
              {note && <small>{note}</small>}
            </label>
          ))}
        </fieldset>
      )}
      {saved && <p role="status">Guardado</p>}
    </section>
  );
}

// The tokens of design-system.md, as CSS custom properties of the container (ADR-012, rule 5).
const STYLES = `
  .np-card { display: grid; gap: var(--space-4); max-width: calc(10 * var(--space-16)); padding: var(--space-8);
    background: var(--color-bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
  .np-card h1 { font-family: var(--font-family-serif); font-size: var(--font-size-2xl); margin: 0; }
  .np-card fieldset { display: grid; gap: var(--space-3); border: none; padding: 0; margin: 0; }
  .np-channel { display: grid; grid-template-columns: auto 1fr; gap: var(--space-1) var(--space-2); align-items: center; }
  .np-channel small { grid-column: 2; color: var(--color-text-secondary); font-size: var(--font-size-xs); }
  .np-error { color: var(--color-error); }
`;
