import { createRoot, Root } from 'react-dom/client';
import { ApiClient } from './api';
import { PreferencesScreen } from './PreferencesScreen';

/**
 * The contract of the React portal (ADR-012, rule 3): the container calls mount when the route
 * /perfil/notificaciones opens, with its API client, and unmount when it is left.
 */
const roots = new WeakMap<Element, Root>();

export function mount(element: Element, { apiClient }: { apiClient: ApiClient }): void {
  unmount(element);
  const root = createRoot(element);
  root.render(<PreferencesScreen apiClient={apiClient} />);
  roots.set(element, root);
}

export function unmount(element: Element): void {
  roots.get(element)?.unmount();
  roots.delete(element);
}
