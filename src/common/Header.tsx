import "./Header.css";

import Logo from "./Logo";

function Header(options: { children?: any }) {
  const { children } = options;

  return (
    <header className="Header">
      <Logo />
      <span>Fluorescent Cell Calculator</span>
      {children}
    </header>
  );
}

export default Header;
