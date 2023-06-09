import { Component, createSignal } from "solid-js";
import { hydrate, render as solidRender } from "solid-js/web";
import { navigate } from "vite-plugin-ssr/client/router";

import { PageContextProvider } from "./PageLayout";

import type { PageContextBuiltInClientWithServerRouting as PageContextBuiltInClient } from "vite-plugin-ssr/types";
import type { PageContext, Route } from "./types";

let dispose: () => void;

const [route, setRoute] = createSignal<Route | null>(null);

async function render(pageContext: PageContextBuiltInClient & PageContext) {
  const content = document.getElementById("root") as HTMLElement;
  const { Page, pageProps, documentProps, headers, redirectTo } = pageContext;

  if (redirectTo) {
    navigate(redirectTo);
    return;
  }

  document.title = documentProps?.title || "EAC";

  setRoute({ Page, pageProps });

  if (dispose) dispose();

  const layout = () => (
    <PageContextProvider
      navigation={!pageContext.urlPathname.includes("admin")}
      pageContext={pageContext}
    >
      <Page {...pageProps} />
    </PageContextProvider>
  );

  if (pageContext.isHydration) {
    if (content.innerHTML === "") {
      dispose = solidRender(() => layout(), content!);
    } else {
      dispose = hydrate(() => layout(), content!);
    }
  } else {
    dispose = solidRender(() => layout(), content!);
  }
}

export default render;
