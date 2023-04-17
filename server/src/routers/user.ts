import { getMe } from "../controllers/user";
import { ProtectedRouter } from "../middleware/express/auth";

const router = ProtectedRouter();

router.get("/me", getMe);

export default router;
