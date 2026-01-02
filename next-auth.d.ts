declare module "next-auth" {
  interface Session {
    apiToken: string;
  }
}
