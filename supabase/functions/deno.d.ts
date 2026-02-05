type DenoServeHandler = (req: Request) => Response | Promise<Response>;

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: DenoServeHandler): void;
};
