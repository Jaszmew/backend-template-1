import dotenv from "dotenv"
import app from "@/app"
import { client } from "@/db/prisma"

dotenv.config()

// Routes
// apiRouter.use("/route", userRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

process.on("beforeExit", async () => {
  console.log("Disconnecting Prisma client...")
  await client.$disconnect()
  console.log("Prisma client disconnected")
})
