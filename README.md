# property-notification-portal

> notification bounded context: web UI (remote)

Part of the **Property** distributed system — Grupo 2 · **React 19** (the React portal of ADR-012) · Node 22 or 24.
Documentation: [`property-docs`](https://github.com/code-corhuila/property-docs), `12-ux-ui/navigation-map.md`
and `09-microservices/services/08-notification/`.

## How the container mounts it

| Route | Local address | Module | Exports |
|---|---|---|---|
| `/perfil/notificaciones` | `http://localhost:4205` | `mount.js` (ES module, React bundled) | `mount(element, { apiClient })`, `unmount(element)` |

ADR-012, rule 3: a wrapper of `property-front` imports `mount.js` when the route opens, calls
`mount` with a framework-neutral **API client** that wraps the container's own (gateway URL,
token, `X-Correlation-Id`, time limit, one error shape with `userMessage`), and calls `unmount`
when the route is left. **This portal never calls `fetch` and never reads a token.** React is
not shared with the Angular container, so the module carries its own copy.

The screen is HU-NOTIF-002: the channels of E-16, each saved alone with a partial `PATCH`
(E-17). In MVP 1 only e-mail is sent; SMS and push keep the preference and the screen says so
(DEC-006 of notification).

## Install, build and test

```bash
npm ci          # installs exactly what package-lock.json records
npm run build   # type check, then dist/mount.js
npm test        # unit tests, one run (Vitest, jsdom)
```

`deploy/` builds the image (`npm ci`, then nginx serving `mount.js` with CORS and no cache) as
the service `notification-portal` on `platform`; `property-infra-postgres` publishes it on 4205.

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `property-docs`.
