package config

import (
	confutils "github.com/RivvyGroup/rivvy/go-pkg/config-utils"
)

// ApplicationConfig represents all of the variables that describe the
// running configuration of the application.
//
// TEMPLATE: Add service-specific integration structs and embed them under
// Integrations if your service needs external providers (e.g. Stripe, Cloudflare).
// Remove the Integrations field entirely if there are no external integrations.
type ApplicationConfig struct {
	// Embed base configuration with common Application and Database fields
	confutils.BaseApplicationConfig

	// TEMPLATE: Uncomment and fill in if the service has external integrations.
	// Integrations struct {
	// 	ExampleProvider exampleProviderSettings `toml:"example-provider"`
	// } `toml:"integrations"`
}

// TEMPLATE: Define integration-specific config structs here, one per provider.
// type exampleProviderSettings struct {
// 	APIKey string `toml:"api-key"`
// }
