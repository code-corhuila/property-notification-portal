import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient, Preferencias } from './api';
import { mount, unmount } from './index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('the notification portal', () => {
  let host: HTMLElement;
  let client: { get: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    host = document.createElement('div');
    document.body.append(host);
    client = { get: vi.fn(), patch: vi.fn() };
  });

  afterEach(() => {
    act(() => unmount(host));
    host.remove();
  });

  async function open(prefs: Preferencias | Error) {
    client.get.mockReturnValue(prefs instanceof Error ? Promise.reject(prefs) : Promise.resolve(prefs));
    await act(async () => mount(host, { apiClient: client as unknown as ApiClient }));
  }
  const box = (name: string) => host.querySelector<HTMLInputElement>(`input[name=${name}]`)!;

  it('mounts with the client of the container and shows the channels of E-16', async () => {
    await open({ email: true, sms: false, push: true });
    expect(client.get).toHaveBeenCalledWith('/api/v1/preferencias');
    expect([box('email').checked, box('sms').checked, box('push').checked]).toEqual([true, false, true]);
    expect(host.textContent).toContain('Aún no enviamos SMS');
  });

  it('saves one channel at a time with a partial PATCH (E-17)', async () => {
    await open({ email: true, sms: false, push: true });
    client.patch.mockResolvedValue({ email: false, sms: false, push: true });
    await act(async () => box('email').click());
    expect(client.patch).toHaveBeenCalledWith('/api/v1/preferencias', { email: false });
    expect(box('email').checked).toBe(false);
    expect(host.querySelector('[role=status]')?.textContent).toBe('Guardado');
  });

  it('shows the message the container decided when a call fails, and keeps the channel', async () => {
    await open({ email: true, sms: false, push: true });
    client.patch.mockRejectedValue({ status: 503, code: 'X', userMessage: 'El servicio no está disponible en este momento' });
    await act(async () => box('sms').click());
    expect(host.querySelector('[role=alert]')?.textContent).toBe('El servicio no está disponible en este momento');
    expect(box('sms').checked).toBe(false);
  });

  it('unmounts when the container leaves the route', async () => {
    await open({ email: true, sms: false, push: true });
    act(() => unmount(host));
    expect(host.innerHTML).toBe('');
  });
});
