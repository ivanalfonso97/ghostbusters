package repositories

import (
	"context"

	"github.com/jackc/pgx/v5"

	dbclient "github.com/RivvyGroup/rivvy/go-pkg/database-client"
	"github.com/RivvyGroup/rivvy/rivvy-example/models"
)

// FindExampleByID retrieves a single example record by its ID.
//
// TEMPLATE: Rename the method and return type to match your domain.
// - Use dbclient.PostgresQueryRow for single-row SELECT statements.
// - Pass pgx.RowToStructByName[T] as the 4th argument — it maps columns to struct fields by db tag.
// - The function returns (T, error), not (*T, error).
// - Columns in SELECT must match the db struct tags on the model exactly.
func (r *ExampleRepository) FindExampleByID(
	ctx context.Context,
	exampleID string,
) (models.Example, error) {
	return dbclient.PostgresQueryRow(
		ctx,
		r.Database,
		`SELECT
			example_id,
			example_status,
			example_name,
			created_at
		FROM "public"."example"
		WHERE example_id = $1`,
		pgx.RowToStructByName[models.Example],
		exampleID,
	)
}
