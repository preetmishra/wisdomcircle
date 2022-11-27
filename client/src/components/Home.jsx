import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Logo from "./assets/Logo";
import Turtle from "./assets/Turtle";
import { isLoggedIn } from "./auth/duck/functions";

export default function Home() {
  const _isLoggedIn = useSelector(isLoggedIn);
  const auth = useSelector((state) => state.auth);

  return (
    <div className="h-full">
      <nav className="w-full flex justify-between px-4 md:px-6 border-b border-neutral-divider bg-neutral-grey py-6 space-x-2">
        <Logo className="w-8 h-8" />
        <div className="flex justify-between space-x-2 md:space-x-4 text-white">
          {_isLoggedIn ? (
            <Link to="/logout">Logout</Link>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <div className="px-4 md:px-6 h-[80vh] w-full flex items-center justify-center flex-col">
        <Turtle className="w-40 h-56" />
        <p className="break-all">
          {_isLoggedIn
            ? `Hi, ${auth.user.firstName} ${auth.user.lastName}! You're logged in currently`
            : "You're not logged in currently"}
        </p>
      </div>
    </div>
  );
}
