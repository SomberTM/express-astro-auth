import type { AstroCookies } from "astro"

type User =
	| {
			isLoggedIn: true
			id: string
			email: string
	  }
	| {
			isLoggedIn: false
			reason: string
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
		const user: User = { ...data.user, isLoggedIn: true }
		return user
	} else {
		const user: User = { reason: data.reason, isLoggedIn: false }
		return user
	}
}
