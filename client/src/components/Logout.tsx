const sendLogoutReq = async () => {
	await fetch("http://localhost:7777/auth/logout", {
		method: "GET",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	})
}

const Logout: React.FC = () => {
	return (
		<div className="flex flex-col items-center">
			<button
				onClick={async () => {
					await sendLogoutReq()
					window.location.href = "/"
				}}
			>
				Logout
			</button>
		</div>
	)
}

export default Logout
