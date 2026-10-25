// TEMPLATE: Replace "rivvy-example" with your service name throughout this file.
module github.com/RivvyGroup/rivvy/rivvy-example

go 1.26.0

require (
	github.com/RivvyGroup/rivvy/go-pkg v0.0.0
	github.com/gofrs/uuid/v5 v5.5.1
	github.com/jackc/pgx/v5 v5.11.0
)

// TEMPLATE: This path resolves correctly while the template lives at rivvy-templates/backend/.
// After copying the service to the monorepo root (rivvy-your-service/), change this to ../go-pkg.
replace github.com/RivvyGroup/rivvy/go-pkg => ../../go-pkg

require (
	github.com/cespare/xxhash/v2 v2.3.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx-gofrs-uuid v0.0.0-20230224015001-1d428863c2e2 // indirect
	github.com/jackc/pgx-shopspring-decimal v0.0.0-20220624020537-1d36b5a1853e // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	github.com/pelletier/go-toml/v2 v2.4.3 // indirect
	github.com/redis/go-redis/v9 v9.23.0 // indirect
	github.com/shopspring/decimal v1.3.1 // indirect
	go.uber.org/atomic v1.12.0 // indirect
	golang.org/x/sync v0.22.0 // indirect
	golang.org/x/sys v0.48.0 // indirect
	golang.org/x/text v0.41.0 // indirect
)
