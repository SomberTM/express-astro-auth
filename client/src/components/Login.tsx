import { useState } from "react"

const sendLoginReq = async (email: string) => {
	const response = await fetch("http://localhost:7777/auth/login", {
		method: "POST",
		body: JSON.stringify({ email }),
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	})

	const data = await response.json()
	return data
}

const sendCompleteLoginReq = async (email: string, code: string) => {
	const response = await fetch(`http://localhost:7777/auth/login/${code}`, {
		method: "POST",
		body: JSON.stringify({ email }),
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	})

	const data = await response.json()
	return data
}

const Login: React.FC = () => {
	const [email, setEmail] = useState("")
	const [codeAttempt, setCodeAttempt] = useState("")
	const [attemptingCompleteLogin, setAttemptingCompleteLogin] = useState(false)
	const [outgoingLoginReq, setOutgoingLoginReq] = useState(false)
	const [redirectHash, setRedirectHash] = useState("")

	return (
		<div className="flex flex-col items-center gap-4">
			<div className="flex flex-col">
				<label htmlFor="email-input">Email: </label>
				<input
					className="border-2 border-white bg-black p-2 outline-none"
					id="email-input"
					type="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
				/>
			</div>
			<button
				onClick={async () => {
					const res = await sendLoginReq(email)
					if (res.success) {
						setRedirectHash(res.redirectHash)
						setOutgoingLoginReq(true)
					}
				}}
			>
				Login
			</button>
			{outgoingLoginReq && (
				<div>
					<label htmlFor="code-input">Code: </label>
					<input
						className="border-2 border-white bg-black p-2 outline-none"
						id="code-input"
						type="text"
						disabled={attemptingCompleteLogin}
						value={codeAttempt}
						onChange={async (event) => {
							const value = event.target.value
							if (value.length <= 6) setCodeAttempt(value)
							if (value.length === 6) {
								window.location.href = `/auth/login/c?i=${redirectHash}`
							}
						}}
					/>
				</div>
			)}
		</div>
	)
}

export default Login
