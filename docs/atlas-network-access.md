# MongoDB Atlas network access

Atlas only accepts connections from IP addresses on the **IP Access List** (Network Access).

## IPv4

| Entry | Meaning |
|-------|---------|
| `203.89.124.224/32` | One specific IPv4 address (your router public IP). |
| `0.0.0.0/0` | Any IPv4 address. Convenient for a small team during development; remove or narrow before production. |

`/32` means a single host. `/24` would be a subnet; course projects usually use `/32` per location.

## IPv6

`0.0.0.0/0` does **not** cover IPv6. If your ISP or campus network connects over IPv6, add a separate entry:

| Entry | Meaning |
|-------|---------|
| `::/0` | Any IPv6 address (same idea as `0.0.0.0/0` for IPv4). |
| `2001:db8::1/128` | One specific IPv6 address (replace with your real address). |

Steps in Atlas:

1. **Network Access** > **IP Access List** > **Add IP Address**.
2. For all IPv6 (dev only): enter `::/0`, add a comment such as `dev IPv6 team`, confirm.
3. For one machine: search "what is my ipv6" from that network, add that address with `/128`.

You can keep both `0.0.0.0/0` and `::/0` during development if teammates hit connection errors on IPv6-only paths.

## Teammates on the same Wi-Fi

Everyone behind the same home router often shares **one public IPv4**. You do not need duplicate entries for each laptop on that network; one `/32` for the router IP is enough.

Teammates on campus or another house need **their** public IP added once (or use the shared dev entries above).

## Temporary access

Atlas can add an entry that auto-expires (e.g. 6 hours). Useful for a lab session; run **Add Current IP Address** when the yellow banner appears.

## Viewing data after seed or register

1. **Database** > **Clusters** > **Browse Collections** (or Data Explorer).
2. Select database **`eldercare`** (not `admin`).
3. Open collection **`users`**.

If the database is missing, the app has not written data yet: check IP access, run `npm run seed` in `server`, then refresh.
