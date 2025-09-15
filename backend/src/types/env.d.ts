declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The environment mode.
     * - 'dev' for development
     * - 'prod' for production
     */
    NODE_ENV: 'dev' | 'prod';

    /**
     * The port the server will listen on.
     * @default '3000'
     */
    PORT: string;

    /**
     * The database connection URL.
     * @example 'postgres://user:pass@localhost:5432/db'
     */
    DB_URL?: string;

    /**
     * The API key for external services.
     */
    API_KEY?: string;

    /**
     * Allowed origins for CORS.
     * - Use '*' to allow all origins.
     * - Or provide a comma-separated list of URLs.
     * @example '*' 
     * @example 'http://localhost:5173,http://example.com'
     */
    ALLOWED_ORIGINS: string;
  }
}
