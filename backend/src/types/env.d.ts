declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The environment mode.
     * - 'dev' for development
     * - 'prod' for production
     */
    NODE_ENV: "dev" | "prod";

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

    GITHUB_BOT_USERNAME: string;
    GITHUB_BOT_PERSONAL_ACCESS_TOKEN: string;
    GITHUB_REPO_OWNER: string;
    GITHUB_REPO_NAME: string;

    /**
     * Argo Demo application name
     *
     * @example 'argo-demo'
     */
    ARGOCD_DEMO_APPLICATION_NAME: string;

    /**
     * Argo Demo namespace in which argo demo app is contained
     *
     * @example 'argocd-demo'
     */
    ARGOCD_DEMO_NAMESPACE: string;

    /**
     * JWT secret for signing tokens
     *
     * @example 'your-super-secret-jwt-key-change-in-production'
     */
    JWT_SECRET: string;

    /**
     * JWT access token expiry time
     *
     * @default '15m'
     * @example '15m', '1h', '7d'
     */
    JWT_ACCESS_EXPIRY?: string;

    /**
     * JWT refresh token expiry time
     *
     * @default '7d'
     * @example '7d', '30d', '90d'
     */
    JWT_REFRESH_EXPIRY?: string;
  }
}
