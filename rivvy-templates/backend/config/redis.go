package config

// RedisKeyFormat is an enum of constants that indicate the format of a Redis
// key name, typically used to access cached values.
//
// Usage:
//
//	fmt.Sprintf(string(RedisKeyFormatExampleByID), exampleID)
//
// TEMPLATE: Replace the sample constant with the key patterns your service
// actually needs. Use the namespace "app:<domain>:<id>" as the prefix
// convention. Remove constants that are unused; add as many as needed.
type RedisKeyFormat string

const (
	// RedisKeyFormatExampleByID accesses a cached example record by its ID.
	// TEMPLATE: Rename and adjust the pattern to match your domain.
	RedisKeyFormatExampleByID RedisKeyFormat = "app:example:%s"
)
