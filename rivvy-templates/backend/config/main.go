package config

import (
	"log/slog"
	"os"

	confutils "github.com/RivvyGroup/rivvy/go-pkg/config-utils"
	dbclient "github.com/RivvyGroup/rivvy/go-pkg/database-client"
	rdsclient "github.com/RivvyGroup/rivvy/go-pkg/redis-client"
)

// ApplicationRuntime encapsulates the live resources for the application:
// config, logger, database pool, and cache client.
//
// TEMPLATE: Add fields here for any external service clients your service needs
// (e.g. StripeClient, GoogleService). Initialize them in MustInitializeApplication
// and close/revoke them in CloseApplication.
type ApplicationRuntime struct {
	Config *ApplicationConfig

	Logger *slog.Logger

	LoggerWriter *confutils.DailyFileWriter

	Database *dbclient.Database

	Cache *rdsclient.Cache
}

// GetConfigFilePath returns the config file path from the environment variable
// RIVVY_EXAMPLE_CONFIG_PATH, defaulting to ./config.toml.
//
// TEMPLATE: Rename the env var to match your service, e.g. RIVVY_PAYMENTS_CONFIG_PATH.
func GetConfigFilePath() string {
	configPath := os.Getenv("RIVVY_EXAMPLE_CONFIG_PATH")
	if len(configPath) < 1 {
		configPath = "./config.toml"
	}

	return configPath
}

// MustInitializeApplication loads config and initializes all runtime resources.
// CloseApplication MUST be deferred after calling this.
//
// Panics if any startup step fails.
func MustInitializeApplication(configPath string) *ApplicationRuntime {
	config := confutils.MustInitializeConfigFile[ApplicationConfig](configPath)

	err := confutils.CreateLogDirectory(config.Application.LogDirectory)
	if err != nil {
		panic(err)
	}

	loggerWriter, err := confutils.NewDailyFileWriter(config.Application.LogDirectory, 0660)
	if err != nil {
		panic(err)
	}

	logger := confutils.MustInitializeLogger(loggerWriter)
	database := dbclient.MustInitializePostgres(config)
	cache := rdsclient.MustInitializeRedis(config)

	var runtimeLogger *slog.Logger
	if config.Application.EnableZulipNotifications {
		// TEMPLATE: Replace "exmp" with a 4-letter abbreviation for your service.
		// This prefix appears in Zulip notification messages.
		notifyingHandler := confutils.NewNotifyingHandler(logger.Handler(), cache.Client, "exmp")
		runtimeLogger = slog.New(notifyingHandler)
	} else {
		runtimeLogger = logger
	}

	return &ApplicationRuntime{
		Config:       config,
		Logger:       runtimeLogger,
		LoggerWriter: loggerWriter,
		Database:     database,
		Cache:        cache,
	}
}

// CloseApplication releases the database pool, Redis client, and log writer.
func CloseApplication(runtime *ApplicationRuntime) {
	runtime.Database.Pool.Close()
	runtime.Cache.Client.Close()
	runtime.LoggerWriter.Close()
}
