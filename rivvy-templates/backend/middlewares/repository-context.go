package middlewares

import (
	"net/http"

	"github.com/RivvyGroup/rivvy/rivvy-example/config"
	"github.com/RivvyGroup/rivvy/rivvy-example/repositories"
)

// RuntimeContextProvider injects the runtime and repository into an HTTP
// handler, returning its http.Handler equivalent to be served.
//
// TEMPLATE: Update the import paths and type references to match your service name.
func RuntimeContextProvider(
	runtime *config.ApplicationRuntime,
	repository *repositories.ExampleRepository,
	f func(http.ResponseWriter, *http.Request, *config.ApplicationRuntime, *repositories.ExampleRepository),
) http.Handler {
	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			f(w, r, runtime, repository)
		},
	)
}
