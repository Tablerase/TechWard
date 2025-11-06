
export const socketNamespaces = {
  DEFAULT: '/',
  WARD: '/ward',
} as const;

export type socketNamespace = (typeof socketNamespaces)[keyof typeof socketNamespaces];

