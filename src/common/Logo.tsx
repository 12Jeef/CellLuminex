import { useNavigate } from "react-router-dom";

import "./Logo.css";

function Logo() {
  const navigate = useNavigate();

  return (
    <button className="Logo" onClick={() => navigate("/")}>
      <span>cell</span>
      <span>luminex</span>
    </button>
  );
}

export default Logo;
