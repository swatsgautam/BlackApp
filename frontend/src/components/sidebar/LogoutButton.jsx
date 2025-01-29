import { BiLogOut } from "react-icons/bi";
import useLogout from "../../hooks/useLogout";

const LogoutButton = () => {
	const { loading, logout } = useLogout();

	return (
		<div className="logout-container">
      {!loading ? (
        <BiLogOut className="logout-icon" onClick={logout} />
      ) : (
        <span className="loading-spinner"></span>
      )}
    </div>
	);
};
export default LogoutButton;
