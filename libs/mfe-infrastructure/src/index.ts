export const microfrontendProjects = [
  'mf-react-catalog',
  'mf-header-ssr',
  'mf-footer-ssr',
  'mf-auth-client'
] as const;

export const platformProjects = [
  'service-discovery',
  ...microfrontendProjects,
  'shell-astro'
] as const;
