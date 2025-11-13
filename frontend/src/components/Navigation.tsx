import { NavLink } from "react-router-dom";
import "./Navigation.css";

export const Navigation = () => {
  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <ul className="nav-list">
        <li className="nav-item">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/patient-room"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Patient Room
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
