const sendLogoutReq = async (): Promise<boolean> => {
	const response = await fetch("http://localhost:7777/auth/logout", {
		method: "GET",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	})
	return response.ok
}

const Logout: React.FC = () => {
	return (
		<div className="flex flex-col items-center">
			<button
				onClick={async () => {
					const success = await sendLogoutReq()
					if (success) window.location.href = "/"
				}}
			>
				Logout
			</button>
		</div>
	)
}

export default Logout
