/* Midgard UI Kit — app shell + client routing */
const { useState: useStateApp, useRef: useRefApp } = React;

function App() {
  const [route, setRoute] = useStateApp("splash");
  const snap = useSnapshot();
  const scrollRef = useRefApp(null);

  const onNav = (k) => {
    // legacy routes consolidated into Get Started
    if (k === "users" || k === "builders" || k === "partners" || k === "build" || k === "participate") k = "get-started";
    setRoute(k);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "auto" });
  };

  if (route === "splash") {
    return <Splash onEnter={() => setRoute("home")} />;
  }

  const mode = route === "home" ? "home" : "interior";

  let page;
  switch (route) {
    case "home": page = <HomePage snap={snap} onNav={onNav} />; break;
    case "how-it-works": page = <HowItWorksPage onNav={onNav} />; break;
    case "about": page = <AboutPage onNav={onNav} />; break;
    case "get-started": page = <GetStartedPage onNav={onNav} />; break;
    case "security": page = <SecurityPage onNav={onNav} />; break;
    case "testnet": page = <TestnetPage snap={snap} onNav={onNav} />; break;
    case "faq": page = <FaqPage onNav={onNav} />; break;
    case "docs": page = <DocsPage onNav={onNav} />; break;
    case "official-links": page = <OfficialLinksPage onNav={onNav} />; break;
    default: page = <StubPage pageKey={route} onNav={onNav} />;
  }

  return (
    <div className="kit-root" ref={scrollRef}>
      <AmbientScene mode={mode} />
      <div className="kit-stack" style={{ position: "relative", zIndex: 10, minHeight: "100%", display: "flex", flexDirection: "column" }}>
        <SiteNav active={route} onNav={onNav} />
        {page}
        <SiteFooter onNav={onNav} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
