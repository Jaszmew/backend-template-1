import { client } from "@/db/prisma"
import { RequestError } from "@/utils/errors"
import { Prisma } from "@prisma/client"
import { StatusCodes } from "http-status-codes"

// Get a calendar by calendar or user ID
const getCalendarById = async (unique: Prisma.CalendarWhereUniqueInput) => {
  const calendar = await client.calendar.findUnique({
    where: unique,
  })

  if (!calendar) {
    throw new RequestError(StatusCodes.NOT_FOUND, "Calendar not found")
  }

  calendar.
  return calendar
}

// Get multiple?

// Create

// Update

// Delete
