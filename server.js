import { serve } from "std/http";
import { contentType } from "std/media_types";
import { extname } from "std/path";

const routes = [
  {
    pattern: new URLPattern({ pathname: "/" }),
    async handle({request}) {
      const body = await Deno.readFile("./static/index.html");

      return new Response(body, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
        }
      })
    },
  },
  {
    pattern: new URLPattern({ pathname: "/:filename+" }),
    async handle({request, params}) {
      const fileURL = new URL(`static/${params.filename}`, import.meta.url);
      try {
        const body = await Deno.readFile(fileURL);

        return new Response(body, {
          headers: {
            'content-type': contentType(extname(params.filename)),
          },
        });
      } catch (error) {
        return new Response("Not found", {
          status: 404,
        });
      }
    },
  },
];

serve(
  async (request) => {
    const {pathname} = new URL(request.url);
    for (const route of routes) {
      const match = route.pattern.exec({ pathname });
      if (match) {
        const params = match.pathname.groups;

        try {
          return await route.handle({ request, params });
        } catch (error) {
          return new Response("Error", {
            status: 500,
          });
        }
      }
    }
  },
);
