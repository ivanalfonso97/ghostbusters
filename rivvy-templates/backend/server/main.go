package server

import (
	"net/http"

	"github.com/RivvyGroup/rivvy/rivvy-example/config"
	"github.com/RivvyGroup/rivvy/rivvy-example/middlewares"
	"github.com/RivvyGroup/rivvy/rivvy-example/repositories"
)

// CreateHTTPServer initializes and returns an HTTP mux with all registered routes.
//
// TEMPLATE: Add one mux.Handle block per endpoint. Each route entry should:
//   - Use the Go 1.22+ "METHOD /path" pattern syntax.
//   - Wrap the handler with middlewares.RuntimeContextProvider.
//   - Keep this file as a route table only — no logic here.
func CreateHTTPServer(
	runtime *config.ApplicationRuntime,
	repository *repositories.ExampleRepository,
) *http.ServeMux {
	mux := http.NewServeMux()

	mux.Handle(
		"POST /examples",
		middlewares.RuntimeContextProvider(
			runtime,
			repository,
			CreateExampleEndpoint,
		),
	)

	mux.Handle(
		"GET /examples/{exampleId}",
		middlewares.RuntimeContextProvider(
			runtime,
			repository,
			FindExampleByIDEndpoint,
		),
	)

	return mux
}
