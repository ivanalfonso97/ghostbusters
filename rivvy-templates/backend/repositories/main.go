package repositories

import (
	dbclient "github.com/RivvyGroup/rivvy/go-pkg/database-client"
	rdsclient "github.com/RivvyGroup/rivvy/go-pkg/redis-client"
)

// ExampleRepository provides methods to interact with the database and cache
// for example-related operations.
//
// TEMPLATE: Rename to match your service domain (e.g. PaymentsRepository).
// Every method lives in its own file named after the operation it performs
// (e.g. create-example.go, find-example-by-id.go).
type ExampleRepository struct {
	Database *dbclient.Database
	Cache    *rdsclient.Cache
}
