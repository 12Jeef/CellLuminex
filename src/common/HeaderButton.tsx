import { Link } from "react-router-dom";
import "./HeaderButton.css";

function HeaderButton(options: { link: string; children?: string }) {
  const { link, children } = options;

  return (
    <Link to={"/" + link} className="HeaderButton">
      <button>{children}</button>
    </Link>
  );
}

export default HeaderButton;
