package main

import (
	"context"
	"os"
	"os/signal"

	confutils "github.com/RivvyGroup/rivvy/go-pkg/config-utils"
	"github.com/RivvyGroup/rivvy/rivvy-example/config"
	"github.com/RivvyGroup/rivvy/rivvy-example/repositories"
	"github.com/RivvyGroup/rivvy/rivvy-example/server"
)

func main() {
	configPath := config.GetConfigFilePath()
	appRuntime := config.MustInitializeApplication(configPath)
	defer config.CloseApplication(appRuntime)

	repository := &repositories.ExampleRepository{
		Database: appRuntime.Database,
		Cache:    appRuntime.Cache,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	confutils.RunHTTPServer(
		ctx,
		appRuntime.Logger,
		appRuntime.Config.Application.Host,
		appRuntime.Config.Application.Port,
		server.CreateHTTPServer(appRuntime, repository),
	)

	appRuntime.Logger.Info("Shutdown complete")
}
