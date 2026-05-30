/* Midgard UI Kit — app shell + client routing */
const { useState: useStateApp, useRef: useRefApp } = React;

function App() {
  const [route, setRoute] = useStateApp("splash");
  const snap = useSnapshot();
  const scrollRef = useRefApp(null);

  const onNav = (k) => {
    setRoute(k);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "auto" });
  };

  if (route === "splash") {
    return <Splash onEnter={() => setRoute("home")} />;
  }

  const mode = route === "home" ? "home" : "interior";
  const showHUD = route === "home" || route === "testnet";

  let page;
  switch (route) {
    case "home": page = <HomePage snap={snap} onNav={onNav} />; break;
    case "how-it-works": page = <HowItWorksPage onNav={onNav} />; break;
    case "users": page = <UsersPage onNav={onNav} />; break;
    case "builders": page = <BuildersPage onNav={onNav} />; break;
    case "security": page = <SecurityPage onNav={onNav} />; break;
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
      {showHUD ? <LiveHUD snap={snap} /> : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
