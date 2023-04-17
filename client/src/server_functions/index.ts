import type { AstroCookies } from "astro"

type User =
	| {
			isLoggedIn: true
			user: {
				id: string
				email: string
			}
			loginErrorReason: undefined
	  }
	| {
			isLoggedIn: false
			user: undefined
			loginErrorReason: string
	  }

export async function getCurrentUser(cookies: AstroCookies): Promise<User> {
	const { value: token } = cookies.get("jwt")

	const response = await fetch("http://localhost:7777/user/me", {
		method: "GET",
		mode: "cors",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Cookie: `jwt=${token}`,
		},
	})

	const data = await response.json()

	if (response.ok) {
		const user: User = {
			user: data.user,
			isLoggedIn: true,
			loginErrorReason: undefined,
		}
		return user
	} else {
		const user: User = {
			user: undefined,
			loginErrorReason: data.reason,
			isLoggedIn: false,
		}
		return user
	}
}
