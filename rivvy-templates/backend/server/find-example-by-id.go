package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5"

	"github.com/RivvyGroup/rivvy/rivvy-example/config"
	"github.com/RivvyGroup/rivvy/rivvy-example/repositories"
)

// FindExampleByIDEndpoint handles GET /examples/{exampleId}.
//
// TEMPLATE: This handler shows the pattern for a GET endpoint that reads a
// path parameter and returns a JSON-encoded model. It also shows how to
// distinguish a "not found" error (404) from a generic database error (500).
func FindExampleByIDEndpoint(
	w http.ResponseWriter,
	r *http.Request,
	_ *config.ApplicationRuntime,
	repository *repositories.ExampleRepository,
) {
	w.Header().Set("Content-Type", "application/json")

	exampleID := r.PathValue("exampleId")

	example, err := repository.FindExampleByID(r.Context(), exampleID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{
				"message": "Example not found",
			})

			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"message": fmt.Sprintf("Failed to retrieve example: %s", err.Error()),
		})

		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(example)
}
