package models

import (
	"time"

	"github.com/gofrs/uuid/v5"
)

// ExampleStatus represents the lifecycle state of an Example record.
//
// TEMPLATE: Rename to match your domain concept and adjust constants to reflect
// the actual states your entity can be in.
type ExampleStatus string

const (
	// ExampleStatusActive indicates the record is live and operational.
	ExampleStatusActive ExampleStatus = "active"

	// ExampleStatusArchived indicates the record has been soft-deleted.
	ExampleStatusArchived ExampleStatus = "archived"
)

// Example is a sample domain model.
//
// TEMPLATE: Rename the struct and all fields to match your actual domain entity.
// Each field needs two struct tags:
//   - db:"column_name"  — must match the exact Postgres column name for pgx scanning.
//   - json:"camelCase"  — the JSON key exposed to API consumers.
//
// Keep one model per file, named after the domain concept (e.g. organization.go, person.go).
type Example struct {
	// ID is the unique identifier for the record.
	ID uuid.UUID `db:"example_id" json:"id"`

	// Status is the current lifecycle state.
	Status ExampleStatus `db:"example_status" json:"status"`

	// Name is a human-readable label.
	Name string `db:"example_name" json:"name"`

	// CreatedAt is when the record was inserted.
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}
