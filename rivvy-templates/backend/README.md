# Backend Service Template

A ready-to-copy scaffold for a new Rivvy Go backend service. Every file contains
`TEMPLATE:` comments that explain what to change. The example domain is called
`example` — rename it to your actual domain throughout.

---

## Quick Start

### 1. Copy the template

```bash
cp -r rivvy-templates/backend rivvy-your-service-name
```

### 2. Rename the module

Search and replace `rivvy-example` with your service name in every file:

```bash
# From inside your new service directory
find . -type f -name "*.go" -o -name "go.mod" | xargs sed -i '' 's/rivvy-example/rivvy-your-service-name/g'
```

### 3. Rename the entity

Every service manages some central entity — in rivvy-organizations it's `Organization`,
in this template it's `Example`. Replace `Example` with the name of your entity (e.g. `Payment`):

```bash
find . -type f -name "*.go" | xargs sed -i '' 's/Example/Payment/g; s/example/payment/g'
```

Then rename the files to match:

```bash
mv models/example.go models/payment.go
mv repositories/create-example.go repositories/create-payment.go
mv repositories/find-example-by-id.go repositories/find-payment-by-id.go
mv server/create-example.go server/create-payment.go
mv server/find-example-by-id.go server/find-payment-by-id.go
```

You'll replace the sample operations (create, find-by-id) with whatever your service
actually needs — these are just there to show the patterns.

### 4. Update the config

Copy `config.template.toml` → `config.toml` and fill in the real values:

```bash
cp config.template.toml config.toml
```

The file has inline comments explaining every field. `config.toml` is gitignored
by default — never commit it.

### 5. Update `go.mod`

- The template's `replace` directive points to `../../go-pkg` (correct for `rivvy-templates/backend/`).
  After copying your service to the monorepo root, change it to `../go-pkg`.
- Run `go mod tidy` to resolve indirect dependencies.

### 6. Run it

```bash
RIVVY_EXAMPLE_CONFIG_PATH=./config.toml go run .
```

---

## Project Structure

```
rivvy-your-service/
├── main.go                        Entry point — 3-step lifecycle: config → runtime → server
├── go.mod
├── config.template.toml           Canonical documentation for all config knobs
├── config/
│   ├── configuration.go           ApplicationConfig struct (embed BaseApplicationConfig + extras)
│   ├── main.go                    ApplicationRuntime, MustInitializeApplication, CloseApplication
│   └── redis.go                   Typed RedisKeyFormat constants
├── middlewares/
│   └── repository-context.go     RuntimeContextProvider — injects runtime+repo into every handler
├── models/
│   └── example.go                 One file per domain concept; db + json struct tags
├── repositories/
│   ├── main.go                    Repository struct (Database + Cache fields)
│   ├── create-example.go          One method per file — write operations use PostgresExec
│   └── find-example-by-id.go     Read operations use PostgresQueryRow
└── server/
    ├── main.go                    Route table only — one mux.Handle block per endpoint
    ├── create-example.go          POST handler — shows decode + write + response pattern
    └── find-example-by-id.go     GET handler — shows path param + read + 404 pattern
```

---

## Patterns to Follow

### One file, one thing

- **models/**: one file per domain struct. No methods, no business logic.
- **repositories/**: `main.go` defines the struct; every other file adds exactly one method.
- **server/**: `main.go` is the route table; every other file is one endpoint.

### Handler signature

All handlers use the four-argument form required by `RuntimeContextProvider`:

```go
func MyEndpoint(
    w http.ResponseWriter,
    r *http.Request,
    runtime *config.ApplicationRuntime,
    repository *repositories.ExampleRepository,
)
```

Use `_` for `runtime` when the handler doesn't need it (most read/write handlers won't).

### Request body structs

Declare them locally inside the handler file — not in the `models` package:

```go
type createExampleRequestBody struct {
    Name string `json:"name"`
}
```

### SQL

Write SQL inline as raw strings. No ORM. Use positional parameters (`$1`, `$2`, ...).
Never interpolate values into the SQL string.

- `dbclient.PostgresExec` — INSERT / UPDATE / DELETE (returns `error`)
- `dbclient.PostgresQueryRow[T]` — single-row SELECT (returns `*T, error`)

### Error responses

Always return `{"message": "..."}` as the JSON envelope. Distinguish:

| Scenario | Status |
|---|---|
| Body decode failure | `422 Unprocessable Entity` |
| Record not found (`pgx.ErrNoRows`) | `404 Not Found` |
| Any other DB error | `500 Internal Server Error` |
| Success (write) | `201 Created` |
| Success (read) | `200 OK` |

### Config

Add service-specific integration config by extending `ApplicationConfig` in
`config/configuration.go`. Match the TOML struct tags to the keys you add in
`config.template.toml`.

### Redis keys

Define all Redis key patterns as typed `RedisKeyFormat` constants in
`config/redis.go`. Use `fmt.Sprintf(string(RedisKeyFormatFoo), id)` at call sites.

---

## Adding a New Endpoint (Checklist)

1. **Model** (if new data shape needed): add `models/your-thing.go`
2. **Repository method**: add `repositories/verb-your-thing.go`
3. **Handler**: add `server/verb-your-thing.go`
4. **Route**: register it in `server/main.go`

That's it — no other files change.
