package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/RivvyGroup/rivvy/rivvy-example/config"
	"github.com/RivvyGroup/rivvy/rivvy-example/repositories"
)

// createExampleRequestBody holds the expected JSON fields for this endpoint.
//
// TEMPLATE: Define the request body struct here, local to this file.
// Do not put request body structs in the models package.
type createExampleRequestBody struct {
	Name string `json:"name"`
}

// CreateExampleEndpoint handles POST /examples.
//
// TEMPLATE: Rename the function and update the repository call and fields
// to match your domain. The four-argument signature is required by
// middlewares.RuntimeContextProvider — do not change it.
//
// Handler contract:
//  1. Set Content-Type: application/json.
//  2. Decode the body with DisallowUnknownFields().
//  3. Call one repository method.
//  4. Return a status code and a {"message": "..."} JSON envelope.
func CreateExampleEndpoint(
	w http.ResponseWriter,
	r *http.Request,
	_ *config.ApplicationRuntime,
	repository *repositories.ExampleRepository,
) {
	w.Header().Set("Content-Type", "application/json")

	body := new(createExampleRequestBody)

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&body); err != nil {
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Unprocessable entity",
		})

		return
	}

	err := repository.CreateExample(r.Context(), body.Name)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"message": fmt.Sprintf("Failed to create example: %s", err.Error()),
		})

		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Example created successfully",
	})
}
