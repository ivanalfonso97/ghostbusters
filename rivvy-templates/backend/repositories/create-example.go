package repositories

import (
	"context"

	dbclient "github.com/RivvyGroup/rivvy/go-pkg/database-client"
)

// CreateExample inserts a new example record into the database.
//
// TEMPLATE: Rename the method and parameters to match your domain.
// - Use dbclient.PostgresExec for INSERT / UPDATE / DELETE statements.
// - Write SQL inline as a raw string; no ORM.
// - Pass each parameter positionally ($1, $2, ...) — never interpolate values into the SQL string.
// - Cast Postgres enum columns explicitly: $1::"schema"."enum_type"
func (r *ExampleRepository) CreateExample(
	ctx context.Context,
	name string,
) error {
	return dbclient.PostgresExec(
		ctx,
		r.Database,
		`INSERT INTO "public"."example" (
			example_name,
			example_status,
			created_at
		) VALUES (
			$1,
			'active'::"public"."example_status",
			now()
		)`,
		name,
	)
}
